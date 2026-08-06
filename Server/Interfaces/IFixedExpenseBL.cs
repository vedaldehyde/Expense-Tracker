using Models;

namespace Interfaces
{
    public interface IFixedExpenseBL
    {
        Task CreateFixedExpenseAsync(BudgetRequest request);
    }
}