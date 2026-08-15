using Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DL
{
    public class SavingsHistoryDL : ISavingsHistoryDL
    {
        private readonly ISupabaseRepository<SavingsHistory> _supabaseRepository;
        public SavingsHistoryDL(ISupabaseRepository<SavingsHistory> supabaseRepository)
        {
            _supabaseRepository = supabaseRepository;
        }

        public async Task CreateSavingsHistoryInDB(SavingsHistory savingsHistory)
        {
            await _supabaseRepository.ExecuteFunctionAsync<object>("create_savings_history", new Dictionary<string, object>
            {
                { "p_user_id", savingsHistory.user_id },
                { "p_budget_id", savingsHistory.budget_id ?? (object)DBNull.Value },
                { "p_saved_amount", savingsHistory.saved_amount },
                { "p_credited_date", savingsHistory.credited_on },
                { "p_description", savingsHistory.description ?? "Savings Contribution" }
            });
        }

        public async Task<double> GetTotalSavingsFromDB(Guid userId)
        {
            var result = await _supabaseRepository.ExecuteFunctionAsync<TotalSavingsResponse>("get_total_savings", new Dictionary<string, object>
            {
                { "p_user_id", userId }
            });
            return result.FirstOrDefault()?.total_savings ?? 0;
        }

        public async Task<double> GetUnallocatedSavingsFromDB(Guid userId)
        {
            var result = await _supabaseRepository.ExecuteFunctionAsync<UnallocatedSavingsResponse>("get_unallocated_savings", new Dictionary<string, object>
            {
                { "p_user_id", userId }
            });
            return result.FirstOrDefault()?.unallocated_savings ?? 0;
        }

        public async Task<ContributionResult> AddSavingsGoalContributionInDB(Guid userId, SavingsContributionRequest request)
        {
            var parameters = new Dictionary<string, object>
            {
                { "p_user_id", userId },
                { "p_budget_id", request.budget_id },
                { "p_amount", request.amount },
                { "p_credited_date", request.credited_on ?? DateTime.UtcNow },
                { "p_description", request.description ?? "Fresh Savings Contribution" }
            };

            var results = await _supabaseRepository.ExecuteFunctionAsync<ContributionResult>("add_savings_goal_contribution", parameters);
            var firstResult = results?.FirstOrDefault();

            if (firstResult == null)
            {
                return new ContributionResult
                {
                    success = false,
                    message = "Database returned no response when executing savings goal contribution."
                };
            }

            return firstResult;
        }
    }
}