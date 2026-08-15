using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Models;

namespace Interfaces
{
    public interface IAccountTransferBL
    {
        Task<TransferResult> TransferBetweenAccountsAsync(Guid userId, AccountTransferRequest request);
        Task<List<AccountTransferDetails>> GetTransfersAsync(Guid userId);
    }
}
