using Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Authorize]
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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            try
            {
                await _incomeBL.CreateIncomeAsync(userId, request);
                return Ok(new { message = "income created successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[IncomeController CreateIncome Error]: {ex.Message}");
                return StatusCode(500, new { message = "Failed to add income source. Please try again." });
            }
        }

        [HttpPost("GetIncomes")]
        public async Task<IActionResult> GetIncomes()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            try
            {
                return Ok(await _incomeBL.GetIncomesAsync(userId));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[IncomeController GetIncomes Error]: {ex.Message}");
                return Ok(new IncomeResponse { incomesList = new System.Collections.Generic.List<Incomes>(), total_balance = 0 });
            }
        }

        [HttpPost("UpdateIncome")]
        [HttpPut("UpdateIncome")]
        public async Task<IActionResult> UpdateIncome([FromBody] IncomeRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            try
            {
                await _incomeBL.UpdateIncomeAsync(userId, request);
                return Ok(new { message = "income updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[IncomeController UpdateIncome Error]: {ex.Message}");
                return StatusCode(500, new { message = "Failed to update income balance. Please try again." });
            }
        }
    }
}