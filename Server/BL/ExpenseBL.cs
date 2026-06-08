using System.Threading.Tasks;
using Interfaces;
using Models;

namespace BL
{
    public class ExpenseBL : IExpenseBL
    {
        private readonly IExpenseDL _expenseDL;
        public ExpenseBL(IExpenseDL expenseDL)
        {
            _expenseDL = expenseDL;
        }
        public async Task CreateExpenseAsync(ExpenseRequest request)
        {
            await _expenseDL.CreateExpenseInDB(request);
        }

        public async Task<List<ExpenseDetails>> GetExpensesAsync()
        {
            var list = await _expenseDL.GetExpensesFromDB();
            return list;
        }
    }
}
