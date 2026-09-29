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
    public class TrainerController : ControllerBase
    {
        private readonly ITrainerService _service;

        public TrainerController(ITrainerService service)
        {
            _service = service;
        }

        // POST: api/trainer
        [Authorize(Roles = "ADMIN,STAFF")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TrainerCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateAsync(dto);
            return StatusCode(201, created);
        }

        // GET: api/trainer
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search = null,
            [FromQuery] bool? activeOnly = null)
        {
            var trainers = await _service.GetAllAsync(search, activeOnly);
            return Ok(trainers);
        }

        // GET: api/trainer/5
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var trainer = await _service.GetByIdAsync(id);
            if (trainer == null)
                return NotFound(new { message = $"Trainer with ID {id} not found" });

            return Ok(trainer);
        }

        // PUT: api/trainer/5
        [Authorize(Roles = "ADMIN,STAFF")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TrainerUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound(new { message = $"Trainer with ID {id} not found" });

            return Ok(updated);
        }

        // DELETE: api/trainer/5
        [Authorize(Roles = "ADMIN,STAFF")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = $"Trainer with ID {id} not found" });

            return Ok(new { message = "Trainer deleted successfully" });
        }

        // PATCH: api/trainer/5/toggle-active
        [Authorize(Roles = "ADMIN,STAFF")]
        [HttpPatch("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var trainer = await _service.ToggleActiveAsync(id);
            if (trainer == null)
                return NotFound(new { message = $"Trainer with ID {id} not found" });

            return Ok(trainer);
        }

        // GET: api/trainer/active
        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            var active = await _service.GetActiveAsync();
            return Ok(active);
        }

        // PUT: api/trainer/deactivate/5 (Legacy support)
        [Authorize(Roles = "ADMIN,STAFF")]
        [HttpPut("deactivate/{id}")]
        public IActionResult Deactivate(int id)
        {
            _service.Deactivate(id);
            return Ok(new { message = "Trainer deactivated" });
        }
    }
}
