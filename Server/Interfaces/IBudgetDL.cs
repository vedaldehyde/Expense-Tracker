using Models;

namespace Interfaces
{
    public interface IBudgetDL
    {
        Task<Guid> CreateBudgetInDB(Budget budget);
        Task<List<BudgetDetails>> GetBudgetsFromDB();
        Task UpdateBudgetSavingsStatus(Guid budgetId);
    }
}