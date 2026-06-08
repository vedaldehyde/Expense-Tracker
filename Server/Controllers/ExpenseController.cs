using Interfaces;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace Server.Controllers
{
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
            await _expenseBL.CreateExpenseAsync(request);
            return Ok(new { message = "Expense created" });
        }

        [HttpPost("GetExpenses")]
        public async Task<IActionResult> GetExpenses()
        {
            var expenses = await _expenseBL.GetExpensesAsync();
            return Ok(expenses);
        }
    }
}