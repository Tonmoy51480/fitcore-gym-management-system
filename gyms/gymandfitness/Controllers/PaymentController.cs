using BLL.DTOs;
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
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _service;

        public PaymentController(IPaymentService service)
        {
            _service = service;
        }

        // POST: api/payment
        [HttpPost]
        public async Task<IActionResult> Pay([FromBody] PaymentCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _service.PayAsync(dto);
                return StatusCode(201, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/payment
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search = null,
            [FromQuery] int? memberId = null,
            [FromQuery] string? paymentMethod = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var payments = await _service.GetAllAsync(search, memberId, paymentMethod, fromDate, toDate);
            return Ok(payments);
        }

        // GET: api/payment/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var payment = await _service.GetByIdAsync(id);
            if (payment == null)
                return NotFound(new { message = $"Payment with ID {id} not found" });

            return Ok(payment);
        }

        // GET: api/payment/by-member/2
        [HttpGet("by-member/{memberId}")]
        public async Task<IActionResult> GetByMember(int memberId)
        {
            var payments = await _service.GetPaymentsByMemberAsync(memberId);
            return Ok(payments);
        }

        // GET: api/payment/total/2
        [HttpGet("total/{memberId}")]
        public async Task<IActionResult> TotalPaid(int memberId)
        {
            var total = await _service.TotalPaidAsync(memberId);
            return Ok(new { memberId, total });
        }

        // GET: api/payment/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalRevenue = await _service.GetTotalRevenueAsync();
            var now = DateTime.UtcNow;
            var monthlyRevenue = await _service.GetMonthlyRevenueAsync(now.Year, now.Month);

            return Ok(new
            {
                totalRevenue,
                monthlyRevenue
            });
        }
    }
}
