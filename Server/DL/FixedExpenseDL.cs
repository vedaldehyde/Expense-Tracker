using Interfaces;
using Models;

namespace DL
{
    public class FixedExpenseDL : IFixedExpenseDL
    {
        private readonly ISupabaseRepository<FixedExpense> _supabaseRepository;
        public FixedExpenseDL(ISupabaseRepository<FixedExpense> supabaseRepository)
        {
            _supabaseRepository = supabaseRepository;
        }
        
        public async Task CreateFixedExpenseInDB(FixedExpense fixedExpense)
        {
            await _supabaseRepository.CreateAsync(fixedExpense);
        }
    }
}