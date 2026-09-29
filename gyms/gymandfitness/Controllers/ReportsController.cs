using BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace gymandfitness.Controllers
{
    [Authorize(Roles = "ADMIN,STAFF")]
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _service;

        public ReportsController(IReportService service)
        {
            _service = service;
        }

        // GET: api/reports/revenue
        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueReport([FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var report = await _service.GetRevenueReportAsync(fromDate, toDate);
            return Ok(report);
        }

        // GET: api/reports/growth
        [HttpGet("growth")]
        public async Task<IActionResult> GetGrowthReport([FromQuery] int months = 6)
        {
            var report = await _service.GetMemberGrowthReportAsync(months);
            return Ok(report);
        }

        // GET: api/reports/trainers
        [HttpGet("trainers")]
        public async Task<IActionResult> GetTrainerReport()
        {
            var report = await _service.GetTrainerReportAsync();
            return Ok(report);
        }

        // GET: api/reports/expired-members
        [HttpGet("expired-members")]
        public async Task<IActionResult> GetExpiredMembersReport()
        {
            var report = await _service.GetExpiredMembersReportAsync();
            return Ok(report);
        }
    }
}
