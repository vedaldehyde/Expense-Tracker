using Models;

namespace Interfaces
{
    public interface IBudgetDL
    {
        Task CreateBudgetInDB(BudgetRequest request);
        Task<List<BudgetDetails>> GetBudgetsFromDB();
    }
}