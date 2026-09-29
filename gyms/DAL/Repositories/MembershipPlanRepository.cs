using DAL.EF;
using DAL.EF.Models;
using DAL.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class MembershipPlanRepository : GenericRepository<MembershipPlan>, IMembershipPlanRepository
    {
        public MembershipPlanRepository(ApplicationDbContext db) : base(db) { }

        public async Task<List<MembershipPlan>> GetActivePlansAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Where(p => p.IsActive)
                .OrderBy(p => p.Price)
                .ToListAsync();
        }

        public async Task<MembershipPlan?> GetByIdWithMembersAsync(int id)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
}
