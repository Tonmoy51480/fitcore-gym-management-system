using DAL.EF.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IMemberRepository : IGenericRepository<Member>
    {
        Task<List<Member>> GetAllWithDetailsAsync();
        Task<Member?> GetByIdWithDetailsAsync(int id);
        Task<List<Member>> GetExpiredMembersAsync();
        Task<List<Member>> GetExpiringSoonMembersAsync(int days = 7);
        Task<List<Member>> GetRecentMembersAsync(int count = 5);

        // Legacy synchronous
        List<Member> GetExpiredMembers();
    }
}
