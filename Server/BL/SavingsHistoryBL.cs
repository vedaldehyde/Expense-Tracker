using DL;
using Interfaces;
using Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BL
{
    public class SavingsHistoryBL : ISavingsHistoryBL
    {
        private readonly ISavingsHistoryDL _savingsHistoryDL;
        private readonly IBudgetDL _budgetDL;

        public SavingsHistoryBL(ISavingsHistoryDL savingsHistoryDL, IBudgetDL budgetDL)
        {
            _budgetDL = budgetDL;
            _savingsHistoryDL = savingsHistoryDL;
        }

        public async Task CreateSavingsHistoryAsync(Guid userId, SavingsHistoryRequest request)
        {
            try
            {
                var dashboard = await _budgetDL.GetBudgetsFromDB(userId);
                if (dashboard == null || !dashboard.Any())
                    return;

                var targetBudget = dashboard.FirstOrDefault(b => b.budget_id == request.budget_id);
                if (targetBudget == null)
                    return;

                if (targetBudget.budget_type?.ToLower() != "savings" && !targetBudget.is_active)
                {
                    return;
                }

                double contributionAmount = request.amount.HasValue && request.amount.Value > 0
                    ? request.amount.Value
                    : (targetBudget.budget_amount > 0 ? targetBudget.budget_amount : targetBudget.target_amount);

                if (contributionAmount <= 0)
                    return;

                var savingsHistory = new SavingsHistory
                {
                    user_id = userId,
                    budget_id = request.budget_id,
                    saved_amount = contributionAmount,
                    credited_on = DateTime.UtcNow,
                    description = request.description ?? "Savings Contribution",
                    created_at = DateTime.UtcNow
                };

                await _savingsHistoryDL.CreateSavingsHistoryInDB(savingsHistory);
            }
            catch (Exception e)
            {
                Console.WriteLine($"[SavingsHistoryBL Error]: {e.Message}");
            }
        }

        public async Task<double> GetTotalSavingsAsync(Guid userId)
        {
            return await _savingsHistoryDL.GetTotalSavingsFromDB(userId);
        }

        public async Task<double> GetUnallocatedSavingsAsync(Guid userId)
        {
            return await _savingsHistoryDL.GetUnallocatedSavingsFromDB(userId);
        }

        public async Task<ContributionResult> AddSavingsGoalContributionAsync(Guid userId, SavingsContributionRequest request)
        {
            if (request == null)
            {
                return new ContributionResult { success = false, message = "Invalid contribution payload." };
            }

            if (request.amount <= 0)
            {
                return new ContributionResult { success = false, message = "Contribution amount must be greater than zero." };
            }

            return await _savingsHistoryDL.AddSavingsGoalContributionInDB(userId, request);
        }
    }
}