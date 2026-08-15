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
    public class ExpenseController : ControllerBase
    {
        private readonly IExpenseBL _expenseBL;
        public ExpenseController(IExpenseBL expenseBL)
        {
            _expenseBL = expenseBL;
        }

        [HttpPost("CreateExpense")]
        public async Task<IActionResult> CreateExpense([FromBody] ExpenseRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            try
            {
                await _expenseBL.CreateExpenseAsync(userId, request);
                return Ok(new { message = "Expense created" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CreateExpense Error]: {ex.Message}");
                return StatusCode(500, new { message = $"Failed to create expense: {ex.Message}" });
            }
        }

        [HttpPost("AddSavingsFundedExpense")]
        public async Task<IActionResult> AddSavingsFundedExpense([FromBody] ExpenseRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            try
            {
                await _expenseBL.CreateSavingsFundedExpenseAsync(userId, request);
                return Ok(new { message = "Savings-funded expense created successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AddSavingsFundedExpense Error]: {ex.Message}");
                return StatusCode(500, new { message = $"Failed to create savings-funded expense: {ex.Message}" });
            }
        }

        [HttpPost("GetExpenses")]
        public async Task<IActionResult> GetExpenses()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            try
            {
                var expenses = await _expenseBL.GetExpensesAsync(userId);
                return Ok(expenses);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetExpenses Error]: {ex.Message}");
                return Ok(new System.Collections.Generic.List<ExpenseDetails>());
            }
        }

        [HttpPost("GetExpenseByCategories")]
        public async Task<IActionResult> GetExpenseByCategories([FromBody] ExpenseCategorySummaryRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            try
            {
                var expenses = await _expenseBL.GetExpenseByCategoryAsync(userId, request);
                return Ok(expenses);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetExpenseByCategories Error]: {ex.Message}");
                return Ok(new System.Collections.Generic.List<ExpenseCategorySummary>());
            }
        }
    }
}