using DAL.EF.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IMembershipPlanRepository : IGenericRepository<MembershipPlan>
    {
        Task<List<MembershipPlan>> GetActivePlansAsync();
        Task<MembershipPlan?> GetByIdWithMembersAsync(int id);
    }
}
