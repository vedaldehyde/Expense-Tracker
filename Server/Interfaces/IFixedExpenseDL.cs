using Models;

namespace Interfaces
{
    public interface IFixedExpenseDL
    {
        Task CreateFixedExpenseInDB(FixedExpense fixedExpense);
    }
}