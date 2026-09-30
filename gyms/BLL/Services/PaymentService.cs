using BLL.DTOs;
using DAL.EF.Models;
using DAL.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _repo;
        private readonly IMemberRepository _memberRepo;
        private readonly INotificationRepository _notifRepo;

        public PaymentService(
            IPaymentRepository repo,
            IMemberRepository memberRepo,
            INotificationRepository notifRepo)
        {
            _repo = repo;
            _memberRepo = memberRepo;
            _notifRepo = notifRepo;
        }

        private static PaymentResponseDTO MapToResponse(Payment p)
        {
            return new PaymentResponseDTO
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
            };
        }

        public async Task<PaymentResponseDTO> PayAsync(PaymentCreateDTO dto)
        {
            if (dto.Amount <= 0)
            {
                throw new ArgumentException("Payment amount must be greater than zero");
            }

            var member = await _memberRepo.GetByIdAsync(dto.MemberId);
            if (member == null)
            {
                throw new KeyNotFoundException($"Member with ID {dto.MemberId} not found");
            }

            var payment = new Payment
            {
                MemberId = dto.MemberId,
                Amount = dto.Amount,
                PaymentDate = DateTime.UtcNow,
                PaymentMethod = string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "Cash" : dto.PaymentMethod,
                TransactionId = !string.IsNullOrWhiteSpace(dto.TransactionId) ? dto.TransactionId : "TXN-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                Notes = dto.Notes
            };

            await _repo.AddAsync(payment);

            await _notifRepo.AddAsync(new Notification
            {
                Title = "Payment Recorded",
                Message = $"Payment of ${payment.Amount:N2} recorded for {member.Name} ({payment.PaymentMethod}).",
                Type = "success",
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                TargetRole = "ALL"
            });

            var created = await _repo.GetByIdWithMemberAsync(payment.Id);
            return MapToResponse(created ?? payment);
        }

        public async Task<List<PaymentResponseDTO>> GetAllAsync(
            string? search = null,
            int? memberId = null,
            string? paymentMethod = null,
            DateTime? fromDate = null,
            DateTime? toDate = null)
        {
            var payments = await _repo.GetAllWithMemberAsync();

            if (memberId.HasValue && memberId.Value > 0)
            {
                payments = payments.Where(p => p.MemberId == memberId.Value).ToList();
            }

            if (!string.IsNullOrWhiteSpace(paymentMethod))
            {
                payments = payments.Where(p => string.Equals(p.PaymentMethod, paymentMethod, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            if (fromDate.HasValue)
            {
                payments = payments.Where(p => p.PaymentDate >= fromDate.Value).ToList();
            }

            if (toDate.HasValue)
            {
                payments = payments.Where(p => p.PaymentDate <= toDate.Value.AddDays(1)).ToList();
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var query = search.Trim().ToLower();
                payments = payments.Where(p =>
                    (p.Member != null && p.Member.Name.ToLower().Contains(query)) ||
                    (p.Member != null && p.Member.Email.ToLower().Contains(query)) ||
                    (p.TransactionId != null && p.TransactionId.ToLower().Contains(query)) ||
                    (p.Notes != null && p.Notes.ToLower().Contains(query))
                ).ToList();
            }

            return payments.Select(MapToResponse).ToList();
        }

        public async Task<PaymentResponseDTO?> GetByIdAsync(int id)
        {
            var payment = await _repo.GetByIdWithMemberAsync(id);
            if (payment == null) return null;
            return MapToResponse(payment);
        }

        public async Task<List<PaymentResponseDTO>> GetPaymentsByMemberAsync(int memberId)
        {
            var payments = await _repo.GetPaymentsByMemberAsync(memberId);
            return payments.Select(MapToResponse).ToList();
        }

        public async Task<decimal> TotalPaidAsync(int memberId)
        {
            return await _repo.GetTotalPaymentByMemberAsync(memberId);
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            return await _repo.GetTotalRevenueAsync();
        }

        public async Task<decimal> GetMonthlyRevenueAsync(int year, int month)
        {
            return await _repo.GetMonthlyRevenueAsync(year, month);
        }

        // Legacy compatibility
        public void Pay(PaymentCreateDTO dto)
        {
            PayAsync(dto).GetAwaiter().GetResult();
        }

        public decimal TotalPaid(int memberId)
        {
            return TotalPaidAsync(memberId).GetAwaiter().GetResult();
        }
    }
}
