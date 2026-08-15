using Models;

namespace Interfaces
{
    public interface IBudgetBL
    {
        Task CreateBudgetAsync(Guid userId, BudgetRequest request);
        Task<List<BudgetDetails>> GetBudgetsAsync(Guid userId);
        Task ProcessBudgetAfterExpense(Guid userId, Guid incomeId);
    }
}