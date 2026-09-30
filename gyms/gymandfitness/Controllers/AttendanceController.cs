using BLL.DTOs;
using BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace gymandfitness.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _service;

        public AttendanceController(IAttendanceService service)
        {
            _service = service;
        }

        // POST: api/attendance/check-in
        [Authorize(Roles = "ADMIN,STAFF")]
        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] AttendanceCheckInDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var session = await _service.CheckInAsync(dto);
            return StatusCode(201, session);
        }

        // POST: api/attendance/check-out
        [Authorize(Roles = "ADMIN,STAFF")]
        [HttpPost("check-out")]
        public async Task<IActionResult> CheckOut([FromBody] AttendanceCheckOutDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var session = await _service.CheckOutAsync(dto.MemberId, dto.Notes);
            return Ok(session);
        }

        // GET: api/attendance/active
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveCheckIns()
        {
            var active = await _service.GetActiveCheckInsAsync();
            return Ok(active);
        }

        // GET: api/attendance/today
        [HttpGet("today")]
        public async Task<IActionResult> GetTodayAttendance()
        {
            var today = await _service.GetTodayAttendanceAsync();
            return Ok(today);
        }

        // GET: api/attendance/member/5
        [HttpGet("member/{memberId}")]
        public async Task<IActionResult> GetMemberHistory(int memberId, [FromQuery] int limit = 50)
        {
            var history = await _service.GetMemberHistoryAsync(memberId, limit);
            return Ok(history);
        }
    }
}
