using Models;

namespace DL
{
    public interface ISavingsHistoryDL
    {
        Task CreateSavingsHistoryInDB(SavingsHistory savingsHistory);
    }
}