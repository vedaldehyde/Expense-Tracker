using System.Threading.Tasks;
using DL;
using Interfaces;
using Models;

namespace BL
{
    public class ExpenseBL : IExpenseBL
    {
        private readonly IExpenseDL _expenseDL;
        private readonly IBudgetBL _budgetBL;

        public ExpenseBL(IExpenseDL expenseDL, IBudgetBL budgetBL)
        {
            _expenseDL = expenseDL;
            _budgetBL = budgetBL;
        }

        public async Task CreateExpenseAsync(ExpenseRequest request)
        {
            await _expenseDL.CreateExpenseInDB(request);
            await _budgetBL.ProcessBudgetAfterExpense(request.income_id);
        }

        public async Task<List<ExpenseDetails>> GetExpensesAsync()
        {
            var list = await _expenseDL.GetExpensesFromDB();
            return list;
        }
    }
}
