using Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoriesBL _categoriesBL;
        public CategoriesController(ICategoriesBL categoriesBL)
        {
            _categoriesBL = categoriesBL;
        }

        [HttpPost("GetCategories")]
        public async Task<IActionResult> GetCategories()
        {
            return Ok(await _categoriesBL.GetCategoriesAsync());
        }

        [HttpPost("CreateCategory")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            if (string.IsNullOrWhiteSpace(request?.CategoryType))
            {
                return BadRequest(new { message = "Category name is required." });
            }

            try
            {
                var category = await _categoriesBL.CreateCategoryAsync(request.CategoryType);
                return Ok(category);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CreateCategory Error]: {ex.Message}");
                return StatusCode(500, new { message = "Failed to create category." });
            }
        }
    }
}
