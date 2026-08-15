using System.Threading.Tasks;
using DL;
using Interfaces;
using Models;
using System;
using System.Collections.Generic;

namespace BL
{
    public class ExpenseBL : IExpenseBL
    {
        private readonly IExpenseDL _expenseDL;
        private readonly IBudgetBL _budgetBL;
        private readonly IIncomeDL _incomeDL;

        public ExpenseBL(IExpenseDL expenseDL, IBudgetBL budgetBL, IIncomeDL incomeDL)
        {
            _expenseDL = expenseDL;
            _budgetBL = budgetBL;
            _incomeDL = incomeDL;
        }

        public async Task CreateExpenseAsync(Guid userId, ExpenseRequest request)
        {
            await _expenseDL.CreateExpenseInDB(userId, request);

            // Deduct expense amount from income balance in DB
            if (request.amount.HasValue && request.amount.Value > 0)
            {
                await _incomeDL.DeductIncomeBalanceInDB(userId, request.income_id, request.amount.Value);
            }

            if (request.income_id.HasValue && request.income_id.Value != Guid.Empty)
            {
                await _budgetBL.ProcessBudgetAfterExpense(userId, request.income_id.Value);
            }
        }

        public async Task CreateSavingsFundedExpenseAsync(Guid userId, ExpenseRequest request)
        {
            await _expenseDL.CreateSavingsFundedExpenseInDB(userId, request);

            if (request.income_id.HasValue && request.income_id.Value != Guid.Empty)
            {
                await _budgetBL.ProcessBudgetAfterExpense(userId, request.income_id.Value);
            }
        }

        public async Task<List<ExpenseDetails>> GetExpensesAsync(Guid userId)
        {
            var list = await _expenseDL.GetExpensesFromDB(userId);
            return list;
        }

        public async Task<List<ExpenseCategorySummary>> GetExpenseByCategoryAsync(Guid userId, ExpenseCategorySummaryRequest request)
        {
            return await _expenseDL.GetExpenseByCategoryAsync(userId, request);
        }
    }
}
