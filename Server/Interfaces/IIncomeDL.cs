using System.Collections.Generic;
using System.Threading.Tasks;
using Models;

namespace Interfaces
{
    public interface IIncomeDL
    {
        Task CreateIncomeInDB(IncomeRequest request);
        Task<IncomeResponse> GetIncomesFromDB();
        Task UpdateIncomeInDB(IncomeRequest request);
    }
}
