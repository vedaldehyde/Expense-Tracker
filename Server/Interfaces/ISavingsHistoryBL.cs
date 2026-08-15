using System;
using System.Threading.Tasks;
using Models;

namespace Interfaces
{
    public interface ISavingsHistoryBL
    {
        Task CreateSavingsHistoryAsync(Guid userId, SavingsHistoryRequest request);
        Task<double> GetTotalSavingsAsync(Guid userId);
        Task<double> GetUnallocatedSavingsAsync(Guid userId);
        Task<ContributionResult> AddSavingsGoalContributionAsync(Guid userId, SavingsContributionRequest request);
    }
}