using BLL.DTOs;
using DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class SearchService : ISearchService
    {
        private readonly IMemberRepository _memberRepo;
        private readonly ITrainerRepository _trainerRepo;
        private readonly IMembershipPlanRepository _planRepo;
        private readonly IWorkoutRepository _workoutRepo;
        private readonly IPaymentRepository _paymentRepo;

        public SearchService(
            IMemberRepository memberRepo,
            ITrainerRepository trainerRepo,
            IMembershipPlanRepository planRepo,
            IWorkoutRepository workoutRepo,
            IPaymentRepository paymentRepo)
        {
            _memberRepo = memberRepo;
            _trainerRepo = trainerRepo;
            _planRepo = planRepo;
            _workoutRepo = workoutRepo;
            _paymentRepo = paymentRepo;
        }

        public async Task<GlobalSearchResultDTO> SearchAsync(string query)
        {
            var result = new GlobalSearchResultDTO();
            if (string.IsNullOrWhiteSpace(query))
                return result;

            var q = query.Trim().ToLower();

            // Search Members
            var members = await _memberRepo.GetAllWithDetailsAsync();
            result.Members = members
                .Where(m =>
                    (m.Name != null && m.Name.ToLower().Contains(q)) ||
                    (m.Email != null && m.Email.ToLower().Contains(q)) ||
                    (m.Phone != null && m.Phone.Contains(q))
                )
                .Take(5)
                .Select(m => new MemberResponseDTO
                {
                    Id = m.Id,
                    Name = m.Name,
                    Email = m.Email,
                    Phone = m.Phone,
                    JoinDate = m.JoinDate,
                    ExpiryDate = m.ExpiryDate,
                    Status = m.Status,
                    MembershipPlanName = m.MembershipPlan?.PlanName,
                    AssignedTrainerName = m.AssignedTrainer?.Name
                }).ToList();

            // Search Trainers
            var trainers = await _trainerRepo.GetAllWithDetailsAsync();
            result.Trainers = trainers
                .Where(t =>
                    (t.Name != null && t.Name.ToLower().Contains(q)) ||
                    (t.Specialty != null && t.Specialty.ToLower().Contains(q)) ||
                    (t.Email != null && t.Email.ToLower().Contains(q))
                )
                .Take(5)
                .Select(t => new TrainerResponseDTO
                {
                    Id = t.Id,
                    Name = t.Name,
                    Email = t.Email,
                    Specialty = t.Specialty,
                    ExperienceYears = t.ExperienceYears,
                    IsActive = t.IsActive
                }).ToList();

            // Search Plans
            var plans = await _planRepo.GetAllAsync();
            result.Plans = plans
                .Where(p =>
                    (p.PlanName != null && p.PlanName.ToLower().Contains(q)) ||
                    (p.Description != null && p.Description.ToLower().Contains(q))
                )
                .Take(5)
                .Select(p => new MembershipPlanResponseDTO
                {
                    Id = p.Id,
                    PlanName = p.PlanName,
                    Description = p.Description,
                    Price = p.Price,
                    DurationMonths = p.DurationMonths,
                    IsActive = p.IsActive
                }).ToList();

            // Search Workouts
            var workouts = await _workoutRepo.GetAllWithTrainerAsync();
            result.Workouts = workouts
                .Where(w =>
                    (w.Title != null && w.Title.ToLower().Contains(q)) ||
                    (w.TargetMuscle != null && w.TargetMuscle.ToLower().Contains(q)) ||
                    (w.Difficulty != null && w.Difficulty.ToLower().Contains(q))
                )
                .Take(5)
                .Select(w => new WorkoutResponseDTO
                {
                    Id = w.Id,
                    Title = w.Title,
                    DurationMinutes = w.DurationMinutes,
                    Difficulty = w.Difficulty,
                    CaloriesBurned = w.CaloriesBurned,
                    TrainerName = w.Trainer?.Name ?? "Unassigned",
                    IsActive = w.IsActive
                }).ToList();

            // Search Payments
            var payments = await _paymentRepo.GetAllWithMemberAsync();
            result.Payments = payments
                .Where(p =>
                    (p.TransactionId != null && p.TransactionId.ToLower().Contains(q)) ||
                    (p.Member != null && p.Member.Name.ToLower().Contains(q)) ||
                    (p.Notes != null && p.Notes.ToLower().Contains(q))
                )
                .Take(5)
                .Select(p => new PaymentResponseDTO
                {
                    Id = p.Id,
                    MemberId = p.MemberId,
                    MemberName = p.Member?.Name ?? "Unknown",
                    MemberEmail = p.Member?.Email ?? "",
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    PaymentMethod = p.PaymentMethod,
                    TransactionId = p.TransactionId
                }).ToList();

            return result;
        }
    }
}
