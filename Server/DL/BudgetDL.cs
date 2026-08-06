using Interfaces;
using Models;

namespace DL
{
    public class BudgetDL : IBudgetDL
    {
        private readonly ISupabaseRepository<Budget> _supabaseRepository;
        public BudgetDL(ISupabaseRepository<Budget> supabaseRepository)
        {
            _supabaseRepository = supabaseRepository;
        }

        public async Task<Guid> CreateBudgetInDB(Budget budget)
        {
            var result = await _supabaseRepository.ExecuteFunctionAsync<BudgetIdResponse>(
                "create_budget",
                new Dictionary<string, object>
                {
                    { "p_user_id", budget.user_id },
                    { "p_budget_name", budget.budget_name ?? string.Empty },
                    { "p_budget_type", budget.budget_type ?? string.Empty},
                    { "p_frequency", budget.frequency ?? string.Empty},
                    { "p_start_date", budget.start_date },
                    { "p_end_date", budget.end_date },
                    { "p_target_amount", budget.target_amount },
                    { "p_income_id", budget.income_id },
                    { "p_variable_expense", budget.variable_expense },
                    { "p_budget_amount", budget.budget_amount }
                });

            return result.First().Id;
        }

        public async Task<List<BudgetDetails>> GetBudgetsFromDB()
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "p_user_id", Guid.Parse("a54182db-cb26-4f43-abb7-abad3c04e6f5")}
            };
            var list = await _supabaseRepository.ExecuteFunctionAsync<BudgetDetails>("get_budget_dashboard", parameters);
            return list ?? new List<BudgetDetails>();
        }

        public async Task UpdateBudgetSavingsStatus(Guid budgetId)
        {
            await _supabaseRepository.ExecuteFunctionAsync<object>("update_budget_savings_status",new Dictionary<string, object>
            {
                {"p_budget_id",budgetId}
            });    
        }
    }
}