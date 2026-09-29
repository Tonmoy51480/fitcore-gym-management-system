using BLL.DTOs;
using BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace gymandfitness.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class WorkoutController : ControllerBase
    {
        private readonly IWorkoutService _service;

        public WorkoutController(IWorkoutService service)
        {
            _service = service;
        }

        // POST: api/workout
        [Authorize(Roles = "ADMIN,TRAINER")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] WorkoutCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _service.CreateAsync(dto);
                return StatusCode(201, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/workout
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search = null,
            [FromQuery] string? difficulty = null,
            [FromQuery] int? trainerId = null)
        {
            var workouts = await _service.GetAllAsync(search, difficulty, trainerId);
            return Ok(workouts);
        }

        // GET: api/workout/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var workout = await _service.GetByIdAsync(id);
            if (workout == null)
                return NotFound(new { message = $"Workout with ID {id} not found" });

            return Ok(workout);
        }

        // PUT: api/workout/5
        [Authorize(Roles = "ADMIN,TRAINER")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] WorkoutUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _service.UpdateAsync(id, dto);
                if (updated == null)
                    return NotFound(new { message = $"Workout with ID {id} not found" });

                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/workout/5
        [Authorize(Roles = "ADMIN,TRAINER")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = $"Workout with ID {id} not found" });

            return Ok(new { message = "Workout deleted successfully" });
        }

        // GET: api/workout/by-trainer/3
        [HttpGet("by-trainer/{trainerId}")]
        public async Task<IActionResult> GetByTrainer(int trainerId)
        {
            var workouts = await _service.GetByTrainerAsync(trainerId);
            return Ok(workouts);
        }

        // GET: api/workout/filter?difficulty=Beginner
        [HttpGet("filter")]
        public async Task<IActionResult> Filter([FromQuery] string difficulty)
        {
            var workouts = await _service.FilterAsync(difficulty);
            return Ok(workouts);
        }
    }
}
