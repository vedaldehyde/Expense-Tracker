using System.Collections.Generic;
using System.Threading.Tasks;
using Models;

namespace Interfaces
{
    public interface IIncomeBL
    {
        Task CreateIncomeAsync(Guid userId, IncomeRequest request);
        Task<IncomeResponse> GetIncomesAsync(Guid userId);
        Task UpdateIncomeAsync(Guid userId, IncomeRequest request);
    }
}
