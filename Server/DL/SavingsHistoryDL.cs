using Interfaces;
using Models;

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

            await _supabaseRepository.ExecuteFunctionAsync<object>("create_savings_history",new Dictionary<string, object>
            {
                {"p_user_id",savingsHistory.user_id},
                {"p_budget_id",savingsHistory.budget_id},
                {"p_amount",savingsHistory.saved_amount},
                {"p_credited_date",savingsHistory.credited_on},
            });
        }
    }
}