using BLL.DTOs;
using DAL.EF.Models;
using DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class MembershipPlanService : IMembershipPlanService
    {
        private readonly IMembershipPlanRepository _repo;

        public MembershipPlanService(IMembershipPlanRepository repo)
        {
            _repo = repo;
        }

        private static MembershipPlanResponseDTO MapToResponse(MembershipPlan p)
        {
            return new MembershipPlanResponseDTO
            {
                Id = p.Id,
                PlanName = p.PlanName,
                Description = p.Description,
                Price = p.Price,
                DurationMonths = p.DurationMonths,
                IsActive = p.IsActive,
                ActiveMembersCount = p.Members?.Count(m => m.ExpiryDate >= DateTime.UtcNow) ?? 0
            };
        }

        public async Task<MembershipPlanResponseDTO> CreateAsync(MembershipPlanCreateDTO dto)
        {
            var plan = new MembershipPlan
            {
                PlanName = dto.PlanName.Trim(),
                Description = dto.Description?.Trim(),
                Price = dto.Price,
                DurationMonths = dto.DurationMonths,
                IsActive = true
            };

            await _repo.AddAsync(plan);
            return MapToResponse(plan);
        }

        public async Task<List<MembershipPlanResponseDTO>> GetAllAsync(bool? activeOnly = null, string? search = null)
        {
            var plans = await _repo.GetAllAsync();

            if (activeOnly.HasValue && activeOnly.Value)
            {
                plans = plans.Where(p => p.IsActive).ToList();
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var query = search.Trim().ToLower();
                plans = plans.Where(p =>
                    (p.PlanName != null && p.PlanName.ToLower().Contains(query)) ||
                    (p.Description != null && p.Description.ToLower().Contains(query))
                ).ToList();
            }

            var result = new List<MembershipPlanResponseDTO>();
            foreach (var p in plans)
            {
                var withMembers = await _repo.GetByIdWithMembersAsync(p.Id);
                result.Add(MapToResponse(withMembers ?? p));
            }

            return result.OrderBy(p => p.Price).ToList();
        }

        public async Task<MembershipPlanResponseDTO?> GetByIdAsync(int id)
        {
            var plan = await _repo.GetByIdWithMembersAsync(id);
            if (plan == null) return null;
            return MapToResponse(plan);
        }

        public async Task<MembershipPlanResponseDTO?> UpdateAsync(int id, MembershipPlanUpdateDTO dto)
        {
            var plan = await _repo.GetByIdWithMembersAsync(id);
            if (plan == null) return null;

            plan.PlanName = dto.PlanName.Trim();
            plan.Description = dto.Description?.Trim();
            plan.Price = dto.Price;
            plan.DurationMonths = dto.DurationMonths;
            plan.IsActive = dto.IsActive;

            await _repo.UpdateAsync(plan);
            return MapToResponse(plan);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var plan = await _repo.GetByIdWithMembersAsync(id);
            if (plan == null) return false;

            // If members are linked, don't hard delete; deactivate instead
            if (plan.Members != null && plan.Members.Any())
            {
                plan.IsActive = false;
                await _repo.UpdateAsync(plan);
                return true;
            }

            await _repo.DeleteAsync(id);
            return true;
        }

        public async Task<MembershipPlanResponseDTO?> ToggleActiveAsync(int id)
        {
            var plan = await _repo.GetByIdWithMembersAsync(id);
            if (plan == null) return null;

            plan.IsActive = !plan.IsActive;
            await _repo.UpdateAsync(plan);
            return MapToResponse(plan);
        }
    }
}
