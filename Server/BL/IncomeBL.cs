using System.Collections.Generic;
using System.Threading.Tasks;
using Interfaces;
using Models;

namespace BL
{
    public class IncomeBL : IIncomeBL
    {
        private readonly IIncomeDL _incomeDL;
        public IncomeBL(IIncomeDL incomeDL)
        {
            _incomeDL = incomeDL;
        }

        public async Task CreateIncomeAsync(IncomeRequest request)
        {
            await _incomeDL.CreateIncomeInDB(request);
        }

        public async Task<IncomeResponse> GetIncomesAsync()
        {
            return await _incomeDL.GetIncomesFromDB();
        }

        public async Task UpdateIncomeAsync(IncomeRequest request)
        {
            await _incomeDL.UpdateIncomeInDB(request);
        }
    }
}
