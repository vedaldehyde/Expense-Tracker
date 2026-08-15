using Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Interfaces
{
    public interface IExpenseBL
    {
        Task CreateExpenseAsync(Guid userId, ExpenseRequest request);
        Task CreateSavingsFundedExpenseAsync(Guid userId, ExpenseRequest request);
        Task<List<ExpenseDetails>> GetExpensesAsync(Guid userId);
        Task<List<ExpenseCategorySummary>> GetExpenseByCategoryAsync(Guid userId, ExpenseCategorySummaryRequest request);
    }
}