using DAL.EF;
using DAL.EF.Models;
using DAL.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class PaymentRepository : GenericRepository<Payment>, IPaymentRepository
    {
        public PaymentRepository(ApplicationDbContext db) : base(db) { }

        public async Task<List<Payment>> GetAllWithMemberAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(p => p.Member)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();
        }

        public async Task<Payment?> GetByIdWithMemberAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(p => p.Member)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<Payment>> GetPaymentsByMemberAsync(int memberId)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(p => p.MemberId == memberId)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalPaymentByMemberAsync(int memberId)
        {
            return await _dbSet
                .Where(p => p.MemberId == memberId)
                .SumAsync(p => p.Amount);
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            return await _dbSet.SumAsync(p => p.Amount);
        }

        public async Task<decimal> GetMonthlyRevenueAsync(int year, int month)
        {
            var startDate = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddMonths(1);
            return await _dbSet
                .Where(p => p.PaymentDate >= startDate && p.PaymentDate < endDate)
                .SumAsync(p => p.Amount);
        }

        public async Task<List<Payment>> GetRecentPaymentsAsync(int count = 5)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(p => p.Member)
                .OrderByDescending(p => p.PaymentDate)
                .Take(count)
                .ToListAsync();
        }

        // Legacy synchronous implementation
        public decimal GetTotalPaymentByMember(int memberId)
        {
            return _dbSet
                .Where(p => p.MemberId == memberId)
                .Sum(p => p.Amount);
        }
    }
}
