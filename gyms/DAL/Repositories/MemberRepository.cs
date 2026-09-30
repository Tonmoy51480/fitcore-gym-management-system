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
    public class MemberRepository : GenericRepository<Member>, IMemberRepository
    {
        public MemberRepository(ApplicationDbContext db) : base(db) { }

        public async Task<List<Member>> GetAllWithDetailsAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(m => m.MembershipPlan)
                .Include(m => m.AssignedTrainer)
                .Include(m => m.Payments)
                .OrderByDescending(m => m.Id)
                .ToListAsync();
        }

        public async Task<Member?> GetByIdWithDetailsAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(m => m.MembershipPlan)
                .Include(m => m.AssignedTrainer)
                .Include(m => m.Payments)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<List<Member>> GetExpiredMembersAsync()
        {
            var now = DateTime.UtcNow;
            return await _dbSet
                .AsNoTracking()
                .Include(m => m.MembershipPlan)
                .Where(m => m.ExpiryDate < now)
                .ToListAsync();
        }

        public async Task<List<Member>> GetExpiringSoonMembersAsync(int days = 7)
        {
            var now = DateTime.UtcNow;
            var targetDate = now.AddDays(days);
            return await _dbSet
                .AsNoTracking()
                .Include(m => m.MembershipPlan)
                .Where(m => m.ExpiryDate >= now && m.ExpiryDate <= targetDate)
                .ToListAsync();
        }

        public async Task<List<Member>> GetRecentMembersAsync(int count = 5)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(m => m.MembershipPlan)
                .OrderByDescending(m => m.JoinDate)
                .Take(count)
                .ToListAsync();
        }

        public async Task<(List<Member> Items, int TotalCount)> GetPagedAsync(int pageNumber, int pageSize, string? search = null, string? status = null, int? planId = null)
        {
            var query = _dbSet.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(m => m.Name.Contains(term) || m.Email.Contains(term) || (m.Phone != null && m.Phone.Contains(term)));
            }

            if (planId.HasValue && planId.Value > 0)
            {
                query = query.Where(m => m.MembershipPlanId == planId.Value);
            }

            if (!string.IsNullOrWhiteSpace(status) && !status.Equals("ALL", StringComparison.OrdinalIgnoreCase))
            {
                var now = DateTime.UtcNow;
                if (status.Equals("Active", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(m => m.ExpiryDate >= now);
                }
                else if (status.Equals("Expired", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(m => m.ExpiryDate < now);
                }
                else if (status.Equals("Expiring Soon", StringComparison.OrdinalIgnoreCase))
                {
                    var warningDate = now.AddDays(7);
                    query = query.Where(m => m.ExpiryDate >= now && m.ExpiryDate <= warningDate);
                }
            }

            int totalCount = await query.CountAsync();

            var items = await query
                .Include(m => m.MembershipPlan)
                .Include(m => m.AssignedTrainer)
                .Include(m => m.Payments)
                .OrderByDescending(m => m.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        // Legacy synchronous implementation
        public List<Member> GetExpiredMembers()
        {
            var now = DateTime.UtcNow;
            return _dbSet
                .Where(m => m.ExpiryDate < now)
                .ToList();
        }
    }
}
