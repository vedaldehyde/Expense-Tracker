using Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BudgetController : ControllerBase
    {
        private readonly IBudgetBL _budgetBL;
        public BudgetController(IBudgetBL budgetBL)
        {
            _budgetBL = budgetBL;
        }

        [HttpPost("CreateBudget")]
        public async Task<IActionResult> CreateBudget([FromBody] BudgetRequest request)
        {
            await _budgetBL.CreateBudgetAsync(request);
            return Ok();
        }
    }
}