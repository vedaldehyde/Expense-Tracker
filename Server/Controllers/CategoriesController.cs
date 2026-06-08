using Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ICategoriesBL _categoriesBL;
        public CategoriesController(IConfiguration config, ICategoriesBL categoriesBL)
        {
            _config = config;
            _categoriesBL = categoriesBL;

        }

        [HttpPost("GetCategories")]
        public async Task<IActionResult> GetCategories()
        {
            return Ok(await _categoriesBL.GetCategoriesAsync());
        }
    }
}
