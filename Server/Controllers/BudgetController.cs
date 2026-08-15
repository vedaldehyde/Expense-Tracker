using Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using System;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Authorize]
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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            try
            {
                await _budgetBL.CreateBudgetAsync(userId, request);
                return Ok(new { message = "Budget created" });
            }
            catch (Postgrest.Exceptions.PostgrestException ex)
            {
                Console.WriteLine($"[BudgetController CreateBudget PostgrestException]: {ex.Message}");
                string message = ExtractCleanMessage(ex.Message);
                return BadRequest(new { message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[BudgetController CreateBudget Exception]: {ex.Message}");
                string message = ExtractCleanMessage(ex.Message);
                return BadRequest(new { message });
            }
        }

        [HttpPost("GetBudgets")]
        public async Task<IActionResult> GetBudgets()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            var budgets = await _budgetBL.GetBudgetsAsync(userId);
            return Ok(budgets);
        }

        private static string ExtractCleanMessage(string rawMessage)
        {
            if (string.IsNullOrEmpty(rawMessage)) return "Failed to create budget.";
            try
            {
                using var doc = JsonDocument.Parse(rawMessage);
                if (doc.RootElement.TryGetProperty("message", out var msgEl) && !string.IsNullOrEmpty(msgEl.GetString()))
                {
                    return msgEl.GetString()!;
                }
            }
            catch
            {
                // Raw text message or standard string
            }
            return rawMessage;
        }
    }
}