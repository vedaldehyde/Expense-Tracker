using Models;

namespace Interfaces
{
    public interface IExpenseDL
    {
        Task CreateExpenseInDB(ExpenseRequest request);
        Task<List<ExpenseDetails>> GetExpensesFromDB();
    }
}