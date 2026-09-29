using DAL.EF;
using DAL.EF.Models;
using DAL.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
    {
        public NotificationRepository(ApplicationDbContext db) : base(db) { }

        public async Task<List<Notification>> GetRecentNotificationsAsync(int count = 10, string? role = null)
        {
            var query = _dbSet.AsNoTracking().AsQueryable();
            if (!string.IsNullOrEmpty(role))
            {
                query = query.Where(n => n.TargetRole == "ALL" || n.TargetRole == role);
            }

            return await query
                .OrderByDescending(n => n.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountAsync(string? role = null)
        {
            var query = _dbSet.AsNoTracking().Where(n => !n.IsRead);
            if (!string.IsNullOrEmpty(role))
            {
                query = query.Where(n => n.TargetRole == "ALL" || n.TargetRole == role);
            }

            return await query.CountAsync();
        }

        public async Task MarkAllAsReadAsync()
        {
            await _dbSet
                .Where(n => !n.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
        }
    }
}
