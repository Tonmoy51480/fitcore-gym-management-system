using BLL.DTOs;
using DAL.EF.Models;
using DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class MemberService : IMemberService
    {
        private readonly IMemberRepository _repo;
        private readonly IMembershipPlanRepository _planRepo;
        private readonly IPaymentRepository _paymentRepo;
        private readonly INotificationRepository _notifRepo;

        public MemberService(
            IMemberRepository repo,
            IMembershipPlanRepository planRepo,
            IPaymentRepository paymentRepo,
            INotificationRepository notifRepo)
        {
            _repo = repo;
            _planRepo = planRepo;
            _paymentRepo = paymentRepo;
            _notifRepo = notifRepo;
        }

        private static string CalculateStatus(DateTime expiryDate, string currentStatus)
        {
            if (string.Equals(currentStatus, "Inactive", StringComparison.OrdinalIgnoreCase))
                return "Inactive";

            var now = DateTime.UtcNow;
            if (expiryDate < now)
                return "Expired";
            if (expiryDate <= now.AddDays(7))
                return "Expiring Soon";

            return "Active";
        }

        private static int CalculateDaysRemaining(DateTime expiryDate)
        {
            var diff = (expiryDate - DateTime.UtcNow).Days;
            return diff > 0 ? diff : 0;
        }

        private MemberResponseDTO MapToResponse(Member m)
        {
            var status = CalculateStatus(m.ExpiryDate, m.Status);
            var totalPaid = m.Payments?.Sum(p => p.Amount) ?? 0;

            return new MemberResponseDTO
            {
                Id = m.Id,
                Name = m.Name,
                Email = m.Email,
                Phone = m.Phone,
                EmergencyContact = m.EmergencyContact,
                JoinDate = m.JoinDate,
                ExpiryDate = m.ExpiryDate,
                Status = status,
                MembershipPlanId = m.MembershipPlanId,
                MembershipPlanName = m.MembershipPlan?.PlanName,
                AssignedTrainerId = m.AssignedTrainerId,
                AssignedTrainerName = m.AssignedTrainer?.Name,
                TotalPaid = totalPaid,
                DaysRemaining = CalculateDaysRemaining(m.ExpiryDate)
            };
        }

        public async Task<MemberResponseDTO> CreateAsync(MemberCreateDTO dto)
        {
            int durationMonths = dto.PlanMonths > 0 ? dto.PlanMonths : 1;
            decimal planPrice = 0;

            if (dto.MembershipPlanId.HasValue && dto.MembershipPlanId.Value > 0)
            {
                var plan = await _planRepo.GetByIdAsync(dto.MembershipPlanId.Value);
                if (plan != null)
                {
                    durationMonths = plan.DurationMonths;
                    planPrice = plan.Price;
                }
            }

            var joinDate = DateTime.UtcNow;
            var expiryDate = joinDate.AddMonths(durationMonths);

            var member = new Member
            {
                Name = dto.Name.Trim(),
                Email = dto.Email.Trim().ToLower(),
                Phone = dto.Phone?.Trim(),
                EmergencyContact = dto.EmergencyContact?.Trim(),
                JoinDate = joinDate,
                ExpiryDate = expiryDate,
                Status = "Active",
                MembershipPlanId = dto.MembershipPlanId > 0 ? dto.MembershipPlanId : null,
                AssignedTrainerId = dto.AssignedTrainerId > 0 ? dto.AssignedTrainerId : null
            };

            await _repo.AddAsync(member);

            // Record initial payment if provided or matching plan price
            decimal paymentAmount = dto.InitialPaymentAmount > 0 ? dto.InitialPaymentAmount : planPrice;
            if (paymentAmount > 0)
            {
                var payment = new Payment
                {
                    MemberId = member.Id,
                    Amount = paymentAmount,
                    PaymentDate = DateTime.UtcNow,
                    PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "Cash" : dto.PaymentMethod,
                    TransactionId = "TXN-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                    Notes = "Initial membership fee"
                };
                await _paymentRepo.AddAsync(payment);
            }

            // Create notification
            await _notifRepo.AddAsync(new Notification
            {
                Title = "New Member Registered",
                Message = $"{member.Name} has joined the gym ({durationMonths} month plan).",
                Type = "success",
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                TargetRole = "ALL"
            });

            var createdWithDetails = await _repo.GetByIdWithDetailsAsync(member.Id);
            return MapToResponse(createdWithDetails ?? member);
        }

        public async Task<List<MemberResponseDTO>> GetAllAsync(string? search = null, string? status = null, int? planId = null)
        {
            var members = await _repo.GetAllWithDetailsAsync();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var query = search.Trim().ToLower();
                members = members.Where(m =>
                    (m.Name != null && m.Name.ToLower().Contains(query)) ||
                    (m.Email != null && m.Email.ToLower().Contains(query)) ||
                    (m.Phone != null && m.Phone.Contains(query))
                ).ToList();
            }

            if (planId.HasValue && planId.Value > 0)
            {
                members = members.Where(m => m.MembershipPlanId == planId.Value).ToList();
            }

            var result = members.Select(MapToResponse).ToList();

            if (!string.IsNullOrWhiteSpace(status))
            {
                result = result.Where(m => string.Equals(m.Status, status, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            return result;
        }

        public async Task<MemberDetailResponseDTO?> GetByIdAsync(int id)
        {
            var m = await _repo.GetByIdWithDetailsAsync(id);
            if (m == null) return null;

            var baseDto = MapToResponse(m);

            var payments = (m.Payments ?? new List<Payment>())
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentResponseDTO
                {
                    Id = p.Id,
                    MemberId = p.MemberId,
                    MemberName = m.Name,
                    MemberEmail = m.Email,
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate,
                    PaymentMethod = p.PaymentMethod,
                    TransactionId = p.TransactionId,
                    Notes = p.Notes
                }).ToList();

            return new MemberDetailResponseDTO
            {
                Id = baseDto.Id,
                Name = baseDto.Name,
                Email = baseDto.Email,
                Phone = baseDto.Phone,
                EmergencyContact = baseDto.EmergencyContact,
                JoinDate = baseDto.JoinDate,
                ExpiryDate = baseDto.ExpiryDate,
                Status = baseDto.Status,
                MembershipPlanId = baseDto.MembershipPlanId,
                MembershipPlanName = baseDto.MembershipPlanName,
                AssignedTrainerId = baseDto.AssignedTrainerId,
                AssignedTrainerName = baseDto.AssignedTrainerName,
                TotalPaid = baseDto.TotalPaid,
                DaysRemaining = baseDto.DaysRemaining,
                Payments = payments
            };
        }

        public async Task<MemberResponseDTO?> UpdateAsync(int id, MemberUpdateDTO dto)
        {
            var member = await _repo.GetByIdWithDetailsAsync(id);
            if (member == null) return null;

            member.Name = dto.Name.Trim();
            member.Email = dto.Email.Trim().ToLower();
            member.Phone = dto.Phone?.Trim();
            member.EmergencyContact = dto.EmergencyContact?.Trim();
            member.MembershipPlanId = dto.MembershipPlanId > 0 ? dto.MembershipPlanId : null;
            member.AssignedTrainerId = dto.AssignedTrainerId > 0 ? dto.AssignedTrainerId : null;

            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                member.Status = dto.Status;
            }

            await _repo.UpdateAsync(member);

            var updated = await _repo.GetByIdWithDetailsAsync(id);
            return MapToResponse(updated ?? member);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var member = await _repo.GetByIdAsync(id);
            if (member == null) return false;

            await _repo.DeleteAsync(id);
            return true;
        }

        public async Task<MemberResponseDTO?> RenewAsync(int id, MemberRenewDTO dto)
        {
            var member = await _repo.GetByIdWithDetailsAsync(id);
            if (member == null) return null;

            int additionalMonths = dto.AdditionalMonths > 0 ? dto.AdditionalMonths : 1;

            if (dto.MembershipPlanId.HasValue && dto.MembershipPlanId.Value > 0)
            {
                var plan = await _planRepo.GetByIdAsync(dto.MembershipPlanId.Value);
                if (plan != null)
                {
                    additionalMonths = plan.DurationMonths;
                    member.MembershipPlanId = plan.Id;
                }
            }

            // If expired, renew starting from now; if still active, extend from current expiry date
            var baseDate = member.ExpiryDate > DateTime.UtcNow ? member.ExpiryDate : DateTime.UtcNow;
            member.ExpiryDate = baseDate.AddMonths(additionalMonths);
            member.Status = "Active";

            await _repo.UpdateAsync(member);

            // Record payment
            if (dto.PaymentAmount > 0)
            {
                var payment = new Payment
                {
                    MemberId = member.Id,
                    Amount = dto.PaymentAmount,
                    PaymentDate = DateTime.UtcNow,
                    PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "Cash" : dto.PaymentMethod,
                    TransactionId = "REN-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                    Notes = !string.IsNullOrWhiteSpace(dto.Notes) ? dto.Notes : $"Membership renewal ({additionalMonths} mo)"
                };
                await _paymentRepo.AddAsync(payment);
            }

            await _notifRepo.AddAsync(new Notification
            {
                Title = "Membership Renewed",
                Message = $"{member.Name}'s membership was extended by {additionalMonths} months.",
                Type = "info",
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                TargetRole = "ALL"
            });

            var updated = await _repo.GetByIdWithDetailsAsync(id);
            return MapToResponse(updated ?? member);
        }

        public async Task<List<MemberResponseDTO>> GetExpiredAsync()
        {
            var expired = await _repo.GetExpiredMembersAsync();
            return expired.Select(MapToResponse).ToList();
        }

        public async Task<List<MemberResponseDTO>> GetExpiringSoonAsync()
        {
            var expiring = await _repo.GetExpiringSoonMembersAsync(7);
            return expiring.Select(MapToResponse).ToList();
        }

        // Legacy compatibility synchronous methods
        public void Create(MemberCreateDTO dto)
        {
            CreateAsync(dto).GetAwaiter().GetResult();
        }

        public List<MemberResponseDTO> GetAll()
        {
            return GetAllAsync().GetAwaiter().GetResult();
        }

        public List<MemberResponseDTO> GetExpired()
        {
            return GetExpiredAsync().GetAwaiter().GetResult();
        }
    }
}
