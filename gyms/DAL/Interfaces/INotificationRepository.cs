using DAL.EF.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DAL.Interfaces
{
    public interface INotificationRepository : IGenericRepository<Notification>
    {
        Task<List<Notification>> GetRecentNotificationsAsync(int count = 10, string? role = null);
        Task<int> GetUnreadCountAsync(string? role = null);
        Task MarkAllAsReadAsync();
    }
}
