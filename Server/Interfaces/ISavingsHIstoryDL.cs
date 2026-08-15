using System;
using System.Threading.Tasks;
using Models;

namespace DL
{
    public interface ISavingsHistoryDL
    {
        Task CreateSavingsHistoryInDB(SavingsHistory savingsHistory);
        Task<double> GetTotalSavingsFromDB(Guid userId);
        Task<double> GetUnallocatedSavingsFromDB(Guid userId);
        Task<ContributionResult> AddSavingsGoalContributionInDB(Guid userId, SavingsContributionRequest request);
    }
}