using Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Interfaces
{
    public interface IExpenseDL
    {
        Task CreateExpenseInDB(Guid userId, ExpenseRequest request);
        Task CreateSavingsFundedExpenseInDB(Guid userId, ExpenseRequest request);
        Task<List<ExpenseDetails>> GetExpensesFromDB(Guid userId);
        Task<List<ExpenseCategorySummary>> GetExpenseByCategoryAsync(Guid userId, ExpenseCategorySummaryRequest request);
    }
}