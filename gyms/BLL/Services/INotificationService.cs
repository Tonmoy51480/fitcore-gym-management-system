using BLL.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BLL.Services
{
    public interface INotificationService
    {
        Task<List<NotificationResponseDTO>> GetRecentAsync(int count = 10, string? role = null);
        Task<int> GetUnreadCountAsync(string? role = null);
        Task MarkAllAsReadAsync();
        Task MarkAsReadAsync(int id);
    }
}
