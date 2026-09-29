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
