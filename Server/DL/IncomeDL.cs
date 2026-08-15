using System.Collections.Generic;
using System.Threading.Tasks;
using Interfaces;
using Models;
using System;
using System.Linq;

namespace DL
{
    public class IncomeDL : IIncomeDL
    {
        private readonly ISupabaseRepository<Income> _supabaseRepository;
        public IncomeDL(ISupabaseRepository<Income> supabaseRepository)
        {
            _supabaseRepository = supabaseRepository;
        }

        public async Task CreateIncomeInDB(Guid userId, IncomeRequest request)
        {
            var income = new Income
            {
                id = Guid.NewGuid(),
                user_id = userId,
                source = request.source,
                balance = request.balance,
                updated_at = DateTime.UtcNow,
                is_salary = request.isSalary
            };

            await _supabaseRepository.CreateAsync(income);
        }

        public async Task<IncomeResponse> GetIncomesFromDB(Guid userId)
        {
            IncomeResponse response = new();
            try
            {
                var userIncomesList = await _supabaseRepository.GetByUserIdAsync(userId) ?? new List<Income>();

                var incomes = userIncomesList.Select(x => new Incomes
                {
                    id = x.id,
                    balance = x.balance ?? 0,
                    source = x.source,
                    isSalary = x.is_salary
                }).ToList();

                double totalBalance = incomes.Sum(x => x.balance ?? 0);

                response.incomesList = incomes;
                response.total_balance = totalBalance;
                return response;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[IncomeDL GetIncomes Error]: {ex.Message}");
                return new IncomeResponse { incomesList = new List<Incomes>(), total_balance = 0 };
            }
        }

        public async Task UpdateIncomeInDB(Guid userId, IncomeRequest request)
        {
            try
            {
                var userIncomes = await _supabaseRepository.GetByUserIdAsync(userId) ?? new List<Income>();
                var existing = userIncomes.FirstOrDefault(x => x.id == request.id && (!x.user_id.HasValue || x.user_id.Value == Guid.Empty || x.user_id.Value == userId));

                if (existing != null)
                {
                    existing.user_id ??= userId;
                    existing.balance = (existing.balance ?? 0) + (request.balance ?? 0);
                    existing.updated_at = DateTime.UtcNow;
                    await _supabaseRepository.UpdateAsync(existing);
                }
                else
                {
                    throw new InvalidOperationException("Income record not found or unauthorized.");
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"[IncomeDL Update Error]: {e.Message}");
                throw;
            }
        }

        public async Task DeductIncomeBalanceInDB(Guid userId, Guid? incomeId, double amount)
        {
            if (amount <= 0) return;

            if (!incomeId.HasValue || incomeId.Value == Guid.Empty)
            {
                throw new InvalidOperationException("A valid income account ID is required.");
            }

            var userIncomes = await _supabaseRepository.GetByUserIdAsync(userId) ?? new List<Income>();
            var targetIncome = userIncomes.FirstOrDefault(i => i.id == incomeId.Value && (!i.user_id.HasValue || i.user_id.Value == Guid.Empty || i.user_id.Value == userId));

            if (targetIncome == null)
            {
                throw new InvalidOperationException("Specified income account not found or unauthorized.");
            }

            double currentBalance = targetIncome.balance ?? 0;
            if (currentBalance < amount)
            {
                throw new InvalidOperationException($"Insufficient available balance in account '{targetIncome.source}' (Available: ₹{currentBalance:N2}, Required: ₹{amount:N2}).");
            }

            targetIncome.balance = currentBalance - amount;
            targetIncome.updated_at = DateTime.UtcNow;
            await _supabaseRepository.UpdateAsync(targetIncome);
            Console.WriteLine($"[DeductIncomeBalance Success]: Deducted {amount} from income {targetIncome.id} for user {userId}. New balance: {targetIncome.balance}");
        }
    }
}
