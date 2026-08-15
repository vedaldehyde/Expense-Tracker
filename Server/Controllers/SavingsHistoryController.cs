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
    public class SavingsHistoryController : ControllerBase
    {
        private readonly ISavingsHistoryBL _savingsBL;
        public SavingsHistoryController(ISavingsHistoryBL savingsHistoryBL)
        {
            _savingsBL = savingsHistoryBL;
        }

        [HttpPost("CreateSavingsHistory")]
        public async Task<IActionResult> CreateSavingsHistory([FromBody] SavingsHistoryRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            await _savingsBL.CreateSavingsHistoryAsync(userId, request);
            return Ok(new { message = "Savings credited" });
        }

        [HttpPost("AddContribution")]
        public async Task<IActionResult> AddContribution([FromBody] SavingsContributionRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            try
            {
                var result = await _savingsBL.AddSavingsGoalContributionAsync(userId, request);

                if (!result.success)
                {
                    return BadRequest(new { message = result.message ?? "Validation failed when creating savings contribution." });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SavingsHistoryController AddContribution Error]: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetTotalSavings")]
        public async Task<IActionResult> GetTotalSavings()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            var total = await _savingsBL.GetTotalSavingsAsync(userId);
            return Ok(new { total_savings = total });
        }

        [HttpGet("GetUnallocatedSavings")]
        public async Task<IActionResult> GetUnallocatedSavings()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            var unallocated = await _savingsBL.GetUnallocatedSavingsAsync(userId);
            return Ok(new { unallocated_savings = unallocated });
        }
    }
}