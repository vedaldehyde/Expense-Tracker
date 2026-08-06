using System.Collections.Generic;
using System.Threading.Tasks;
using Interfaces;
using Models;

namespace DL
{
    public class IncomeDL : IIncomeDL
    {
        private readonly ISupabaseRepository<Income> _supabaseRepository;
        public IncomeDL(ISupabaseRepository<Income> supabaseRepository)
        {
            _supabaseRepository = supabaseRepository;
        }

        public async Task CreateIncomeInDB(IncomeRequest request)
        {
            try
            {
                var income = new Income
                {
                    id = Guid.NewGuid(),
                    source = request.source,
                    balance = request.balance,
                    updated_at = DateTime.Now,
                    is_salary = request.isSalary
                };
                await _supabaseRepository.CreateAsync(income);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message.ToString());
            }
        }

        public async Task<IncomeResponse> GetIncomesFromDB()
        {
            IncomeResponse response = new();
            var incomesList = await _supabaseRepository.GetAllAsync();
            var incomes = incomesList.Select(x => new Incomes
            {
                id = x.id,
                balance = x.balance,
                source = x.source,
                isSalary = x.is_salary

            }).ToList();

            double totalBalance = Convert.ToDouble(incomes.Sum(x => x.balance));
            response.incomesList = incomes;
            response.total_balance = totalBalance;

            return response;
        }

        public async Task UpdateIncomeInDB(IncomeRequest request)
        {
            try
            {
                // Find income by id
                var all = await _supabaseRepository.GetAllAsync();
                var existing = all.FirstOrDefault(x => x.id == request.id);

                if (existing == null)
                    throw new Exception("Income not found");

                existing.balance += request.balance;
                existing.updated_at = DateTime.UtcNow;

                await _supabaseRepository.UpdateAsync(existing);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                throw;
            }
        }
    }
}
