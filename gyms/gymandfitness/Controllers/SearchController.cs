using BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace gymandfitness.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _service;

        public SearchController(ISearchService service)
        {
            _service = service;
        }

        // GET: api/search?q=...
        [HttpGet]
        public async Task<IActionResult> GlobalSearch([FromQuery] string? q = null)
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return Ok(new BLL.DTOs.GlobalSearchResultDTO());
            }

            var results = await _service.SearchAsync(q);
            return Ok(results);
        }
    }
}
