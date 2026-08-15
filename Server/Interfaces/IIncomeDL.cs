using System.Collections.Generic;
using System.Threading.Tasks;
using Models;
using System;

namespace Interfaces
{
    public interface IIncomeDL
    {
        Task CreateIncomeInDB(Guid userId, IncomeRequest request);
        Task<IncomeResponse> GetIncomesFromDB(Guid userId);
        Task UpdateIncomeInDB(Guid userId, IncomeRequest request);
        Task DeductIncomeBalanceInDB(Guid userId, Guid? incomeId, double amount);
    }
}
