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

        public async Task CreateBudgetInDB(BudgetRequest request)
        {
            var budget = new Budget
            {
                budget_name = request.budget_name,
                id = Guid.NewGuid(),
                user_id = Guid.Parse("a54182db-cb26-4f43-abb7-abad3c04e6f5"),
                start_date = request.start_date,
                end_date = request.end_date,
                is_active = request.start_date >= DateTime.Now,
                target_amount = request.target_amount
            };
            try
            {
                await _supabaseRepository.CreateAsync(budget);
            }
            catch (Exception e)
            {
               System.Console.WriteLine(e.Message.ToString());
            }
        }
    }
}