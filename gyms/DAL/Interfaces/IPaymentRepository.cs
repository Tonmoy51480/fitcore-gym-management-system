using DAL.EF.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IPaymentRepository : IGenericRepository<Payment>
    {
        Task<List<Payment>> GetAllWithMemberAsync();
        Task<Payment?> GetByIdWithMemberAsync(int id);
        Task<List<Payment>> GetPaymentsByMemberAsync(int memberId);
        Task<decimal> GetTotalPaymentByMemberAsync(int memberId);
        Task<decimal> GetTotalRevenueAsync();
        Task<decimal> GetMonthlyRevenueAsync(int year, int month);
        Task<List<Payment>> GetRecentPaymentsAsync(int count = 5);

        // Legacy synchronous
        decimal GetTotalPaymentByMember(int memberId);
    }
}
