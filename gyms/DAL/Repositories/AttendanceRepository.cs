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
    public class AttendanceRepository : GenericRepository<Attendance>, IAttendanceRepository
    {
        public AttendanceRepository(ApplicationDbContext db) : base(db) { }

        public async Task<List<Attendance>> GetActiveCheckInsAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(a => a.Member)
                    .ThenInclude(m => m.MembershipPlan)
                .Where(a => a.CheckOutTime == null)
                .OrderByDescending(a => a.CheckInTime)
                .ToListAsync();
        }

        public async Task<List<Attendance>> GetByMemberIdAsync(int memberId, int limit = 50)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(a => a.MemberId == memberId)
                .OrderByDescending(a => a.CheckInTime)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<List<Attendance>> GetTodayAttendanceAsync()
        {
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            return await _dbSet
                .AsNoTracking()
                .Include(a => a.Member)
                .Where(a => a.CheckInTime >= today && a.CheckInTime < tomorrow)
                .OrderByDescending(a => a.CheckInTime)
                .ToListAsync();
        }

        public async Task<Attendance?> GetActiveCheckInForMemberAsync(int memberId)
        {
            return await _dbSet
                .Where(a => a.MemberId == memberId && a.CheckOutTime == null)
                .OrderByDescending(a => a.CheckInTime)
                .FirstOrDefaultAsync();
        }
    }
}
