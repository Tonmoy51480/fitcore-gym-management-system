using BLL.DTOs;
using DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class ReportService : IReportService
    {
        private readonly IPaymentRepository _paymentRepo;
        private readonly IMemberRepository _memberRepo;
        private readonly ITrainerRepository _trainerRepo;

        public ReportService(
            IPaymentRepository paymentRepo,
            IMemberRepository memberRepo,
            ITrainerRepository trainerRepo)
        {
            _paymentRepo = paymentRepo;
            _memberRepo = memberRepo;
            _trainerRepo = trainerRepo;
        }

        public async Task<RevenueReportDTO> GetRevenueReportAsync(DateTime? fromDate = null, DateTime? toDate = null)
        {
            var payments = await _paymentRepo.GetAllWithMemberAsync();

            if (fromDate.HasValue)
                payments = payments.Where(p => p.PaymentDate >= fromDate.Value).ToList();

            if (toDate.HasValue)
                payments = payments.Where(p => p.PaymentDate <= toDate.Value.AddDays(1)).ToList();

            decimal totalRevenue = payments.Sum(p => p.Amount);
            int totalTransactions = payments.Count;
            decimal avg = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

            var monthlyGroups = payments
                .GroupBy(p => new { p.PaymentDate.Year, p.PaymentDate.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g =>
                {
                    var dt = new DateTime(g.Key.Year, g.Key.Month, 1);
                    var sum = g.Sum(x => x.Amount);
                    var count = g.Count();
                    return new RevenueReportItemDTO
                    {
                        Period = dt.ToString("MMMM yyyy", CultureInfo.InvariantCulture),
                        TotalAmount = sum,
                        TransactionCount = count,
                        AverageTransaction = count > 0 ? sum / count : 0
                    };
                }).ToList();

            var methods = payments
                .GroupBy(p => p.PaymentMethod)
                .ToDictionary(g => g.Key, g => g.Sum(x => x.Amount));

            return new RevenueReportDTO
            {
                TotalRevenue = totalRevenue,
                TotalTransactions = totalTransactions,
                AveragePayment = Math.Round(avg, 2),
                MonthlyBreakdown = monthlyGroups,
                MethodBreakdown = methods
            };
        }

        public async Task<MemberGrowthReportDTO> GetMemberGrowthReportAsync(int months = 6)
        {
            var members = await _memberRepo.GetAllWithDetailsAsync();
            var now = DateTime.UtcNow;

            var growthPoints = new List<MonthlyGrowthPointDTO>();
            for (int i = months - 1; i >= 0; i--)
            {
                var dt = now.AddMonths(-i);
                int y = dt.Year;
                int m = dt.Month;

                int joined = members.Count(mb => mb.JoinDate.Year == y && mb.JoinDate.Month == m);
                int expired = members.Count(mb => mb.ExpiryDate.Year == y && mb.ExpiryDate.Month == m && mb.ExpiryDate < now);

                growthPoints.Add(new MonthlyGrowthPointDTO
                {
                    Month = dt.ToString("MMM yyyy", CultureInfo.InvariantCulture),
                    Joined = joined,
                    Expired = expired
                });
            }

            int total = members.Count;
            int active = members.Count(m => m.ExpiryDate >= now && m.Status != "Inactive");
            int expiredTotal = members.Count(m => m.ExpiryDate < now || m.Status == "Inactive");

            return new MemberGrowthReportDTO
            {
                TotalMembers = total,
                ActiveMembers = active,
                ExpiredMembers = expiredTotal,
                MonthlyGrowth = growthPoints
            };
        }

        public async Task<List<TrainerReportItemDTO>> GetTrainerReportAsync()
        {
            var trainers = await _trainerRepo.GetAllWithDetailsAsync();

            return trainers.Select(t => new TrainerReportItemDTO
            {
                TrainerId = t.Id,
                TrainerName = t.Name,
                Specialty = t.Specialty,
                AssignedMembersCount = t.Members?.Count ?? 0,
                TotalWorkoutsCount = t.Workouts?.Count ?? 0,
                IsActive = t.IsActive
            }).OrderByDescending(t => t.AssignedMembersCount).ToList();
        }

        public async Task<List<MemberResponseDTO>> GetExpiredMembersReportAsync()
        {
            var expired = await _memberRepo.GetExpiredMembersAsync();
            return expired.Select(m => new MemberResponseDTO
            {
                Id = m.Id,
                Name = m.Name,
                Email = m.Email,
                Phone = m.Phone,
                JoinDate = m.JoinDate,
                ExpiryDate = m.ExpiryDate,
                Status = "Expired",
                MembershipPlanName = m.MembershipPlan?.PlanName,
                DaysRemaining = 0
            }).OrderBy(m => m.ExpiryDate).ToList();
        }
    }
}
