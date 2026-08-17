using Interfaces;
using Models;
using Repositories;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace DL
{
    public class ExpenseDL : IExpenseDL
    {
        private readonly ISupabaseRepository<Expense> _supabaseRepository;
        public ExpenseDL(ISupabaseRepository<Expense> supabaseRepository)
        {
            _supabaseRepository = supabaseRepository;
        }
        
        private async Task<Guid?> ResolveOrCreateCategoryAsync(
            Supabase.Client client,
            string? categoryIdRaw,
            string? categoryNameRaw)
        {
            var categoriesRes = await client.From<Categories>().Get();
            var validCategories = categoriesRes.Models ?? new List<Categories>();

            // 1. If request.category_id contains a valid UUID that exists in categories, use it.
            if (!string.IsNullOrWhiteSpace(categoryIdRaw) && Guid.TryParse(categoryIdRaw, out Guid targetGuid) && targetGuid != Guid.Empty)
            {
                var matchedById = validCategories.FirstOrDefault(c => c.id == targetGuid);
                if (matchedById != null)
                {
                    return matchedById.id;
                }
            }

            // 2. Otherwise, if request.category contains a non-empty category name:
            if (!string.IsNullOrWhiteSpace(categoryNameRaw))
            {
                var trimmedName = categoryNameRaw.Trim();

                // Skip if categoryName is a raw GUID string
                if (!Guid.TryParse(trimmedName, out _))
                {
                    // Search existing categories case-insensitively
                    var matchedByName = validCategories.FirstOrDefault(c =>
                        c.category_type != null && c.category_type.Equals(trimmedName, StringComparison.OrdinalIgnoreCase));

                    if (matchedByName != null)
                    {
                        return matchedByName.id;
                    }

                    // If not found, create a new categories record with a new UUID and the supplied category name
                    var newCatId = (!string.IsNullOrWhiteSpace(categoryIdRaw) && Guid.TryParse(categoryIdRaw, out Guid preGenGuid) && preGenGuid != Guid.Empty)
                        ? preGenGuid
                        : Guid.NewGuid();

                    var newCategory = new Categories
                    {
                        id = newCatId,
                        category_type = trimmedName
                    };

                    // Only use newly generated category ID after DB insert succeeds.
                    // If insertion fails, exception propagates and expense creation fails.
                    await client.From<Categories>().Insert(newCategory);
                    Console.WriteLine($"[ExpenseDL.ResolveOrCreateCategoryAsync]: Inserted new category '{trimmedName}' ({newCatId}).");
                    return newCatId;
                }
            }

            // 3. No fallback to validCategories.First().id or any arbitrary category
            return null;
        }

        public async Task CreateExpenseInDB(Guid userId, ExpenseRequest request)
        {
            var client = _supabaseRepository.GetClient();

            Guid? categoryId = await ResolveOrCreateCategoryAsync(client, request.category_id, request.category);

            Guid? validIncomeId = (request.income_id.HasValue && request.income_id.Value != Guid.Empty) ? request.income_id.Value : null;

            // Validate that selected income account belongs strictly to authenticated userId
            if (validIncomeId.HasValue)
            {
                var incomeRepo = new SupabaseRepository<Income>(client);
                var userIncomes = await incomeRepo.GetByUserIdAsync(userId) ?? new List<Income>();
                var targetIncome = userIncomes.FirstOrDefault(i => i.id == validIncomeId.Value && i.user_id == userId);

                if (targetIncome == null)
                {
                    throw new InvalidOperationException("Selected income account not found or unauthorized.");
                }
            }

            var expense = new Expense
            {
                id = Guid.NewGuid(),
                user_id = userId,
                category_id = categoryId,
                title = request.title,
                description = request.description,
                amount = request.amount,
                payment_method = request.payment_method,
                transaction_date = request.date != default ? request.date : DateTime.UtcNow,
                priority = request.priority,
                income_id = validIncomeId
            };

            await _supabaseRepository.CreateAsync(expense);
            Console.WriteLine($"[ExpenseDL Success]: Inserted expense {expense.id} ({expense.title}) into expense table.");
        }

        public async Task CreateSavingsFundedExpenseInDB(Guid userId, ExpenseRequest request)
        {
            var client = _supabaseRepository.GetClient();

            Guid? categoryId = await ResolveOrCreateCategoryAsync(client, request.category_id, request.category);

            Guid? validIncomeId = (request.income_id.HasValue && request.income_id.Value != Guid.Empty) ? request.income_id.Value : null;
            if (!validIncomeId.HasValue)
            {
                throw new InvalidOperationException("A valid income account ID is required for savings-funded expense.");
            }

            var parameters = new Dictionary<string, object>
            {
                { "p_user_id", userId },
                { "p_income_id", validIncomeId.Value },
                { "p_category_id", categoryId.HasValue ? (object)categoryId.Value : DBNull.Value },
                { "p_title", request.title ?? "Expense" },
                { "p_description", request.description ?? "Savings-funded shortfall expense" },
                { "p_amount", request.amount ?? 0 },
                { "p_payment_method", request.payment_method ?? "Savings Vault" },
                { "p_priority", request.priority ?? "Medium" },
                { "p_transaction_date", request.date != default ? request.date : DateTime.UtcNow }
            };

            await _supabaseRepository.ExecuteFunctionAsync<object>("create_savings_funded_expense", parameters);
            Console.WriteLine($"[ExpenseDL Success]: Executed create_savings_funded_expense for user {userId}, income {validIncomeId.Value}.");
        }

        public async Task<List<ExpenseDetails>> GetExpensesFromDB(Guid userId)
        {
            try
            {
                var userExpenses = await _supabaseRepository.GetByUserIdAsync(userId) ?? new List<Expense>();
                userExpenses = userExpenses.Where(e => e.user_id == userId).ToList();

                var categoryRepo = new SupabaseRepository<Categories>(_supabaseRepository.GetClient());
                var categories = await categoryRepo.GetAllAsync() ?? new List<Categories>();
                var catDict = categories.ToDictionary(c => c.id, c => c.category_type ?? "General");

                return userExpenses.Select(e => new ExpenseDetails
                {
                    expense_id = e.id,
                    amount = e.amount,
                    title = e.title,
                    description = e.description,
                    transaction_date = e.transaction_date,
                    category_type = e.category_id.HasValue && catDict.TryGetValue(e.category_id.Value, out var catName) ? catName : "General"
                }).OrderByDescending(e => e.transaction_date).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ExpenseDL GetExpenses Error]: {ex.Message}");
                return new List<ExpenseDetails>();
            }
        }

        public async Task<List<ExpenseCategorySummary>> GetExpenseByCategoryAsync(Guid userId, ExpenseCategorySummaryRequest request)
        {
            try
            {
                var userExpenses = await _supabaseRepository.GetByUserIdAsync(userId) ?? new List<Expense>();
                var categoryRepo = new SupabaseRepository<Categories>(_supabaseRepository.GetClient());
                var categories = await categoryRepo.GetAllAsync() ?? new List<Categories>();
                var catDict = categories.ToDictionary(c => c.id, c => c.category_type ?? "General");

                var filtered = userExpenses.Where(e => e.user_id == userId &&
                                                   e.transaction_date.HasValue &&
                                                   e.transaction_date.Value.Month == request.month &&
                                                   e.transaction_date.Value.Year == request.year);

                return filtered.GroupBy(e => e.category_id)
                    .Select(g => new ExpenseCategorySummary
                    {
                        category_id = g.Key ?? Guid.Empty,
                        category_type = g.Key.HasValue && catDict.TryGetValue(g.Key.Value, out var cName) ? cName : "Other",
                        amount = (decimal)g.Sum(e => e.amount ?? 0)
                    }).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ExpenseDL GetExpenseByCategory Error]: {ex.Message}");
                return new List<ExpenseCategorySummary>();
            }
        }
    }
}