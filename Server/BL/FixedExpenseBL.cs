using Interfaces;
using Models;

namespace BL
{
    public class FixedExpenseBL : IFixedExpenseBL
    {
        public FixedExpenseBL()
        {

        }
        
        public Task CreateFixedExpenseAsync(BudgetRequest request)
        {
            return Task.CompletedTask;
        }
    }
}