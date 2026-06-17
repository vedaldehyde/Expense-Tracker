using Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IncomeController : ControllerBase
    {
        private readonly IIncomeBL _incomeBL;
        public IncomeController(IIncomeBL incomeBL)
        {
            _incomeBL = incomeBL;
        }

        [HttpPost("CreateIncome")]
        public async Task<IActionResult> CreateIncome([FromBody] IncomeRequest request)
        {
            await _incomeBL.CreateIncomeAsync(request);
            return Ok(new { message = "income created successfully" });
        }

        [HttpPost("GetIncomes")]
        public async Task<IActionResult> GetIncomes()
        {
            return Ok(await _incomeBL.GetIncomesAsync());
        }

        [HttpPut("UpdateIncome")]
        public async Task<IActionResult> UpdateIncome([FromBody] IncomeRequest request)
        {
            await _incomeBL.UpdateIncomeAsync(request);
            return Ok(new { message = "income updated successfully" });
        }
    }
}