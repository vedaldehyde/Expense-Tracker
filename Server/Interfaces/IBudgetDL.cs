using Models;

namespace Interfaces
{
    public interface IBudgetDL
    {
        Task<Guid> CreateBudgetInDB(Budget budget);
        Task<List<BudgetDetails>> GetBudgetsFromDB(Guid userId);
        Task UpdateBudgetSavingsStatus(Guid budgetId);
    }
}