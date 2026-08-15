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

        public async Task CreateIncomeAsync(Guid userId, IncomeRequest request)
        {
            await _incomeDL.CreateIncomeInDB(userId, request);
        }

        public async Task<IncomeResponse> GetIncomesAsync(Guid userId)
        {
            return await _incomeDL.GetIncomesFromDB(userId);
        }

        public async Task UpdateIncomeAsync(Guid userId, IncomeRequest request)
        {
            await _incomeDL.UpdateIncomeInDB(userId, request);
        }
    }
}
