using DL;
using Interfaces;
using Models;
using System.Linq;

namespace BL
{
    public class BudgetBL : IBudgetBL
    {
        private readonly IBudgetDL _budgetDL;
        private readonly IFixedExpenseDL _fixedExpenseDL;
        private readonly ISavingsHistoryDL _savingsHistoryDL;
        public BudgetBL(IBudgetDL budgetDL, IFixedExpenseDL fixedExpenseDL, ISavingsHistoryDL savingsHistoryDL)
        {
            _budgetDL = budgetDL;
            _fixedExpenseDL = fixedExpenseDL;
            _savingsHistoryDL = savingsHistoryDL;
        }
        
        public async Task CreateBudgetAsync(Guid userId, BudgetRequest request)
        {
            var budget = new Budget
            {
                user_id = userId,
                budget_name = request.budget_name,
                start_date = request.start_date,
                end_date = request.end_date,
                target_amount = request.target_amount,
                frequency = request.budget_frequency,
                budget_type = request.budget_type,
                income_id = request.income_id,
                variable_expense = request.variableExpenses,
                budget_amount = request.budget_amount
            };

            // Database generates UUID
            Guid budgetId = await _budgetDL.CreateBudgetInDB(budget);

            if (string.Equals(request.budget_type, "regular", StringComparison.OrdinalIgnoreCase) && request.fixedExpenses != null && request.fixedExpenses.Count > 0)
            {
                foreach (var expense in request.fixedExpenses)
                {
                    var fixedExpense = new FixedExpense
                    {
                        user_id = userId,
                        budget_id = budgetId,
                        category_id = expense.category_id,
                        name = expense.expense_name,
                        description = expense.description
                    };

                    await _fixedExpenseDL.CreateFixedExpenseInDB(fixedExpense);
                }
            }
        }

        public async Task<List<BudgetDetails>> GetBudgetsAsync(Guid userId)
        {
            var list = await _budgetDL.GetBudgetsFromDB(userId);
            return list;
        }
        
        public async Task ProcessBudgetAfterExpense(Guid userId, Guid incomeId)
        {
            // Expenses dynamically affect regular budget spent_amount in get_budget_dashboard.
            // Per Rule 9 & 29, expenses do NOT directly modify or create savings_history records.
            await Task.CompletedTask;
        }
    }
}