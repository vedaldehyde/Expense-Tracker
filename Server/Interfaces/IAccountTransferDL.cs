using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Models;

namespace DL
{
    public interface IAccountTransferDL
    {
        Task<TransferResult> TransferBetweenAccountsInDB(Guid userId, AccountTransferRequest request);
        Task<List<AccountTransferDetails>> GetTransfersFromDB(Guid userId);
    }
}
