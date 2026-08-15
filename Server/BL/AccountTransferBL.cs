using DL;
using Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BL
{
    public class AccountTransferBL : IAccountTransferBL
    {
        private readonly IAccountTransferDL _accountTransferDL;

        public AccountTransferBL(IAccountTransferDL accountTransferDL)
        {
            _accountTransferDL = accountTransferDL;
        }

        public async Task<TransferResult> TransferBetweenAccountsAsync(Guid userId, AccountTransferRequest request)
        {
            if (request == null)
            {
                return new TransferResult { success = false, message = "Invalid transfer payload." };
            }

            if (request.amount <= 0)
            {
                return new TransferResult { success = false, message = "Transfer amount must be greater than zero." };
            }

            if (request.from_income_id == Guid.Empty || request.to_income_id == Guid.Empty)
            {
                return new TransferResult { success = false, message = "Source and destination accounts are required." };
            }

            if (request.from_income_id == request.to_income_id)
            {
                return new TransferResult { success = false, message = "Source and destination accounts cannot be the same." };
            }

            return await _accountTransferDL.TransferBetweenAccountsInDB(userId, request);
        }

        public async Task<List<AccountTransferDetails>> GetTransfersAsync(Guid userId)
        {
            return await _accountTransferDL.GetTransfersFromDB(userId);
        }
    }
}
