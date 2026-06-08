using Models;

namespace Interfaces
{
    public interface IBudgetBL
    {
        Task CreateBudgetAsync(BudgetRequest request);
    }
}