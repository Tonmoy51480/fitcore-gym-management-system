using BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace gymandfitness.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _service;

        public NotificationController(INotificationService service)
        {
            _service = service;
        }

        // GET: api/notification
        [HttpGet]
        public async Task<IActionResult> GetRecent([FromQuery] int count = 10)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var list = await _service.GetRecentAsync(count, role);
            return Ok(list);
        }

        // GET: api/notification/unread-count
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var count = await _service.GetUnreadCountAsync(role);
            return Ok(new { unreadCount = count });
        }

        // POST: api/notification/mark-all-read
        [HttpPost("mark-all-read")]
        public async Task<IActionResult> MarkAllRead()
        {
            await _service.MarkAllAsReadAsync();
            return Ok(new { message = "All notifications marked as read" });
        }

        // PATCH: api/notification/5/read
        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkRead(int id)
        {
            await _service.MarkAsReadAsync(id);
            return Ok(new { message = "Notification marked as read" });
        }
    }
}
