using Microsoft.AspNetCore.Mvc;
using EFDataAccess;
using EFDataAccess.Seed;

namespace API.Controllers
{
    [ApiController]
    [Route("api/seed")]
    public class SystemController : ControllerBase
    {
        private readonly BlogContext _context;

        public SystemController(BlogContext context)
        {
            _context = context;
        }

        [HttpPost("seed")]
        public IActionResult Seed()
        {
            DataSeeder.SeedInitialData(_context);
            return Ok("Seed completed.");
        }
    }
}