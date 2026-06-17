using System.Collections.Generic;
using System.Threading.Tasks;
using Models;

namespace Interfaces
{
    public interface IIncomeBL
    {
        Task CreateIncomeAsync(IncomeRequest request);
        Task<IncomeResponse> GetIncomesAsync();
        Task UpdateIncomeAsync(IncomeRequest request);
    }
}
