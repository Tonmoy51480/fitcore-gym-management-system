using BLL.DTOs;
using DAL.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repo;

        public NotificationService(INotificationRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<NotificationResponseDTO>> GetRecentAsync(int count = 10, string? role = null)
        {
            var notifications = await _repo.GetRecentNotificationsAsync(count, role);
            return notifications.Select(n => new NotificationResponseDTO
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                CreatedAt = n.CreatedAt,
                IsRead = n.IsRead
            }).ToList();
        }

        public async Task<int> GetUnreadCountAsync(string? role = null)
        {
            return await _repo.GetUnreadCountAsync(role);
        }

        public async Task MarkAllAsReadAsync()
        {
            await _repo.MarkAllAsReadAsync();
        }

        public async Task MarkAsReadAsync(int id)
        {
            var notif = await _repo.GetByIdAsync(id);
            if (notif != null)
            {
                notif.IsRead = true;
                await _repo.UpdateAsync(notif);
            }
        }
    }
}
