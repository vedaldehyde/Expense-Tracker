using Models;

namespace Interfaces
{
    public interface IBudgetDL
    {
        Task CreateBudgetInDB(BudgetRequest request);
    }
}