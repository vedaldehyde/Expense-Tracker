using Interfaces;
using Models;

namespace DL
{
    public class ExpenseDL : IExpenseDL
    {
        private readonly ISupabaseRepository<Expense> _supabaseRepository;
        public ExpenseDL(ISupabaseRepository<Expense> supabaseRepository)
        {
            _supabaseRepository = supabaseRepository;
        }
        
        public async Task CreateExpenseInDB(ExpenseRequest request)
        {
            System.Console.WriteLine("Category id ",request.category_id);
            // safely parse category_id, fall back to a new GUID if parsing fails or input is null
            Guid categoryId;
            if (!Guid.TryParse(request.category_id, out categoryId))
            {
                categoryId = Guid.NewGuid();
            }

            var expense = new Expense
            {
                id = Guid.NewGuid(),
                user_id = Guid.Parse("a54182db-cb26-4f43-abb7-abad3c04e6f5"),
                category_id = categoryId,
                title = request.title,
                description = request.description,
                amount = request.amount,
                payment_method = request.payment_method,
                transaction_date = DateTime.Now
            };
            try
            {
                await _supabaseRepository.CreateAsync(expense);
            }
            catch (Exception e)
            {
               System.Console.WriteLine(e.Message.ToString());
            }
            
        }

        public async Task<List<ExpenseDetails>> GetExpensesFromDB()
        {
            // For now fetch all expenses; you can filter based on request later
            var list = await _supabaseRepository.ExecuteFunctionAsync<ExpenseDetails>("get_expense_details");
            return list ?? new List<ExpenseDetails>();
        }
    }
}