using BLL.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Services
{
    public interface IPaymentService
    {
        Task<PaymentResponseDTO> PayAsync(PaymentCreateDTO dto);
        Task<List<PaymentResponseDTO>> GetAllAsync(string? search = null, int? memberId = null, string? paymentMethod = null, DateTime? fromDate = null, DateTime? toDate = null);
        Task<PaymentResponseDTO?> GetByIdAsync(int id);
        Task<List<PaymentResponseDTO>> GetPaymentsByMemberAsync(int memberId);
        Task<decimal> TotalPaidAsync(int memberId);
        Task<decimal> GetTotalRevenueAsync();
        Task<decimal> GetMonthlyRevenueAsync(int year, int month);

        // Legacy compatibility
        void Pay(PaymentCreateDTO dto);
        decimal TotalPaid(int memberId);
    }
}
