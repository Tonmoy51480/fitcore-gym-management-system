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
    public class MembershipPlanController : ControllerBase
    {
        private readonly IMembershipPlanService _service;

        public MembershipPlanController(IMembershipPlanService service)
        {
            _service = service;
        }

        // POST: api/membershipplan
        [Authorize(Roles = "ADMIN")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MembershipPlanCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateAsync(dto);
            return StatusCode(201, created);
        }

        // GET: api/membershipplan
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] bool? activeOnly = null,
            [FromQuery] string? search = null)
        {
            var plans = await _service.GetAllAsync(activeOnly, search);
            return Ok(plans);
        }

        // GET: api/membershipplan/5
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var plan = await _service.GetByIdAsync(id);
            if (plan == null)
                return NotFound(new { message = $"Membership Plan with ID {id} not found" });

            return Ok(plan);
        }

        // PUT: api/membershipplan/5
        [Authorize(Roles = "ADMIN")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MembershipPlanUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound(new { message = $"Membership Plan with ID {id} not found" });

            return Ok(updated);
        }

        // DELETE: api/membershipplan/5
        [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = $"Membership Plan with ID {id} not found" });

            return Ok(new { message = "Membership Plan deleted or deactivated successfully" });
        }

        // PATCH: api/membershipplan/5/toggle-active
        [Authorize(Roles = "ADMIN")]
        [HttpPatch("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var plan = await _service.ToggleActiveAsync(id);
            if (plan == null)
                return NotFound(new { message = $"Membership Plan with ID {id} not found" });

            return Ok(plan);
        }
    }
}
