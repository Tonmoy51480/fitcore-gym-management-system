using BLL.DTOs;
using DAL.EF.Models;
using DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IMemberRepository _memberRepo;
        private readonly ITrainerRepository _trainerRepo;
        private readonly IMembershipPlanRepository _planRepo;
        private readonly IPaymentRepository _paymentRepo;

        public DashboardService(
            IMemberRepository memberRepo,
            ITrainerRepository trainerRepo,
            IMembershipPlanRepository planRepo,
            IPaymentRepository paymentRepo)
        {
            _memberRepo = memberRepo;
            _trainerRepo = trainerRepo;
            _planRepo = planRepo;
            _paymentRepo = paymentRepo;
        }

        private static string CalculateStatus(DateTime expiryDate, string currentStatus)
        {
            if (string.Equals(currentStatus, "Inactive", StringComparison.OrdinalIgnoreCase))
                return "Inactive";

            var now = DateTime.UtcNow;
            if (expiryDate < now) return "Expired";
            if (expiryDate <= now.AddDays(7)) return "Expiring Soon";
            return "Active";
        }

        public async Task<DashboardSummaryDTO> GetSummaryAsync()
        {
            var now = DateTime.UtcNow;
            var members = await _memberRepo.GetAllWithDetailsAsync();
            var trainers = await _trainerRepo.GetAllWithDetailsAsync();
            var plans = await _planRepo.GetAllAsync();
            var payments = await _paymentRepo.GetAllWithMemberAsync();

            int totalMembers = members.Count;
            int activeMembers = 0;
            int expiredMembers = 0;
            int expiringSoonMembers = 0;
            int inactiveMembers = 0;

            foreach (var m in members)
            {
                var st = CalculateStatus(m.ExpiryDate, m.Status);
                if (st == "Active") activeMembers++;
                else if (st == "Expired") expiredMembers++;
                else if (st == "Expiring Soon") expiringSoonMembers++;
                else if (st == "Inactive") inactiveMembers++;
            }

            int totalTrainers = trainers.Count;
            int activeTrainers = trainers.Count(t => t.IsActive);
            int totalPlans = plans.Count;

            decimal totalRevenue = payments.Sum(p => p.Amount);
            decimal currentMonthRevenue = payments
                .Where(p => p.PaymentDate.Year == now.Year && p.PaymentDate.Month == now.Month)
                .Sum(p => p.Amount);

            // Last 6 months revenue history
            var revenueHistory = new List<MonthlyRevenuePointDTO>();
            for (int i = 5; i >= 0; i--)
            {
                var dt = now.AddMonths(-i);
                int y = dt.Year;
                int m = dt.Month;
                var monthRevenue = payments
                    .Where(p => p.PaymentDate.Year == y && p.PaymentDate.Month == m)
                    .Sum(p => p.Amount);
                var newMembersCount = members
                    .Count(mb => mb.JoinDate.Year == y && mb.JoinDate.Month == m);

                revenueHistory.Add(new MonthlyRevenuePointDTO
                {
                    Year = y,
                    MonthNumber = m,
                    Month = dt.ToString("MMM yyyy", CultureInfo.InvariantCulture),
                    Revenue = monthRevenue,
                    NewMembers = newMembersCount
                });
            }

            // Plan distribution
            var planDist = new List<PlanDistributionDTO>();
            var groupedPlans = members
                .GroupBy(m => m.MembershipPlan?.PlanName ?? "Custom / No Plan")
                .ToList();

            foreach (var g in groupedPlans)
            {
                decimal pct = totalMembers > 0 ? Math.Round(((decimal)g.Count() / totalMembers) * 100, 1) : 0;
                planDist.Add(new PlanDistributionDTO
                {
                    PlanName = g.Key,
                    MemberCount = g.Count(),
                    Percentage = pct
                });
            }

            // Recent members
            var recentMembers = members
                .OrderByDescending(m => m.JoinDate)
                .Take(5)
                .Select(m => new MemberResponseDTO
                {
                    Id = m.Id,
                    Name = m.Name,
                    Email = m.Email,
                    Phone = m.Phone,
                    JoinDate = m.JoinDate,
                    ExpiryDate = m.ExpiryDate,
                    Status = CalculateStatus(m.ExpiryDate, m.Status),
                    MembershipPlanName = m.MembershipPlan?.PlanName,
                    AssignedTrainerName = m.AssignedTrainer?.Name,
                    TotalPaid = m.Payments?.Sum(p => p.Amount) ?? 0
                }).ToList();

            // Recent payments
            var recentPayments = payments
                .OrderByDescending(p => p.PaymentDate)
                .Take(5)
                .Select(p => new PaymentResponseDTO
                {
                    Id = p.Id,
                    MemberId = p.MemberId,
                    MemberName = p.Member?.Name ?? "Unknown Member",
                    MemberEmail = p.Member?.Email ?? "",
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    PaymentMethod = p.PaymentMethod,
                    TransactionId = p.TransactionId,
                    Notes = p.Notes
                }).ToList();

            // Upcoming expirations (next 14 days)
            var upcomingExpirations = members
                .Where(m => m.ExpiryDate >= now && m.ExpiryDate <= now.AddDays(14))
                .OrderBy(m => m.ExpiryDate)
                .Take(5)
                .Select(m => new MemberResponseDTO
                {
                    Id = m.Id,
                    Name = m.Name,
                    Email = m.Email,
                    Phone = m.Phone,
                    JoinDate = m.JoinDate,
                    ExpiryDate = m.ExpiryDate,
                    Status = CalculateStatus(m.ExpiryDate, m.Status),
                    MembershipPlanName = m.MembershipPlan?.PlanName,
                    AssignedTrainerName = m.AssignedTrainer?.Name,
                    DaysRemaining = (m.ExpiryDate - now).Days
                }).ToList();

            // Active trainers list
            var activeTrainersList = trainers
                .Where(t => t.IsActive)
                .Take(5)
                .Select(t => new TrainerResponseDTO
                {
                    Id = t.Id,
                    Name = t.Name,
                    Email = t.Email,
                    Phone = t.Phone,
                    Specialty = t.Specialty,
                    ExperienceYears = t.ExperienceYears,
                    IsActive = t.IsActive,
                    WorkoutCount = t.Workouts?.Count ?? 0,
                    MemberCount = t.Members?.Count ?? 0
                }).ToList();

            return new DashboardSummaryDTO
            {
                TotalMembers = totalMembers,
                ActiveMembers = activeMembers,
                ExpiredMembers = expiredMembers,
                ExpiringSoonMembers = expiringSoonMembers,
                TotalTrainers = totalTrainers,
                ActiveTrainers = activeTrainers,
                TotalPlans = totalPlans,
                TotalRevenue = totalRevenue,
                CurrentMonthRevenue = currentMonthRevenue,
                StatusBreakdown = new StatusBreakdownDTO
                {
                    Active = activeMembers,
                    Expired = expiredMembers,
                    ExpiringSoon = expiringSoonMembers,
                    Inactive = inactiveMembers
                },
                RevenueHistory = revenueHistory,
                PlanDistribution = planDist,
                RecentMembers = recentMembers,
                RecentPayments = recentPayments,
                UpcomingExpirations = upcomingExpirations,
                ActiveTrainersList = activeTrainersList
            };
        }
    }
}
