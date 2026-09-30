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
    public class MemberController : ControllerBase
    {
        private readonly IMemberService _service;

        public MemberController(IMemberService service)
        {
            _service = service;
        }

        // POST: api/member
        [Authorize(Roles = "ADMIN,STAFF")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MemberCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateAsync(dto);
            return StatusCode(201, created);
        }

        // GET: api/member
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search = null,
            [FromQuery] string? status = null,
            [FromQuery] int? planId = null)
        {
            var members = await _service.GetAllAsync(search, status, planId);
            return Ok(members);
        }

        // GET: api/member/paged?pageNumber=1&pageSize=10
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? status = null,
            [FromQuery] int? planId = null)
        {
            var paged = await _service.GetPagedAsync(pageNumber, pageSize, search, status, planId);
            return Ok(paged);
        }

        // GET: api/member/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var member = await _service.GetByIdAsync(id);
            if (member == null)
                return NotFound(new { message = $"Member with ID {id} not found" });

            return Ok(member);
        }

        // PUT: api/member/5
        [Authorize(Roles = "ADMIN,STAFF")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] MemberUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound(new { message = $"Member with ID {id} not found" });

            return Ok(updated);
        }

        // DELETE: api/member/5
        [Authorize(Roles = "ADMIN,STAFF")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = $"Member with ID {id} not found" });

            return Ok(new { message = "Member deleted successfully" });
        }

        // POST: api/member/5/renew
        [Authorize(Roles = "ADMIN,STAFF")]
        [HttpPost("{id}/renew")]
        public async Task<IActionResult> Renew(int id, [FromBody] MemberRenewDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var renewed = await _service.RenewAsync(id, dto);
            if (renewed == null)
                return NotFound(new { message = $"Member with ID {id} not found" });

            return Ok(renewed);
        }

        // GET: api/member/expired
        [HttpGet("expired")]
        public async Task<IActionResult> Expired()
        {
            var members = await _service.GetExpiredAsync();
            return Ok(members);
        }

        // GET: api/member/expiring-soon
        [HttpGet("expiring-soon")]
        public async Task<IActionResult> ExpiringSoon()
        {
            var members = await _service.GetExpiringSoonAsync();
            return Ok(members);
        }
    }
}
