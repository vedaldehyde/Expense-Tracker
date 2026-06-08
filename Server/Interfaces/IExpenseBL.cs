using Models;

namespace Interfaces
{
    public interface IExpenseBL
    {
        Task CreateExpenseAsync(ExpenseRequest request);
        Task<List<ExpenseDetails>> GetExpensesAsync();
    }
}