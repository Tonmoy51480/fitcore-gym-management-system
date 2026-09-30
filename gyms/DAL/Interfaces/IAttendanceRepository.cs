using DAL.EF.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface IAttendanceRepository : IGenericRepository<Attendance>
    {
        Task<List<Attendance>> GetActiveCheckInsAsync();
        Task<List<Attendance>> GetByMemberIdAsync(int memberId, int limit = 50);
        Task<List<Attendance>> GetTodayAttendanceAsync();
        Task<Attendance?> GetActiveCheckInForMemberAsync(int memberId);
    }
}
