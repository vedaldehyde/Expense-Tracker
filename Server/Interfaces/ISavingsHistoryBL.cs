using Models;

namespace Interfaces
{
    public interface ISavingsHistoryBL
    {
        Task CreateSavingsHistoryAsync(SavingsHistoryRequest request);
    }
}