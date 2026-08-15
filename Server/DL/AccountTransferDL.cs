using DL;
using Interfaces;
using Models;
using Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DL
{
    public class AccountTransferDL : IAccountTransferDL
    {
        private readonly ISupabaseRepository<AccountTransfer> _supabaseRepository;
        public AccountTransferDL(ISupabaseRepository<AccountTransfer> supabaseRepository)
        {
            _supabaseRepository = supabaseRepository;
        }

        public async Task<TransferResult> TransferBetweenAccountsInDB(Guid userId, AccountTransferRequest request)
        {
            if (request == null)
            {
                return new TransferResult { success = false, message = "Transfer request payload cannot be empty." };
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

            try
            {
                var parameters = new Dictionary<string, object>
                {
                    { "p_user_id", userId },
                    { "p_from_income_id", request.from_income_id },
                    { "p_to_income_id", request.to_income_id },
                    { "p_amount", request.amount },
                    { "p_description", request.description ?? "Account Transfer" }
                };

                var results = await _supabaseRepository.ExecuteFunctionAsync<TransferResult>("transfer_between_accounts", parameters);
                var firstResult = results?.FirstOrDefault();

                if (firstResult != null)
                {
                    return firstResult;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AccountTransferDL RPC Error, attempting fallback]: {ex.Message}");
            }

            // Fallback for environment before SQL script is run on Supabase
            return await ExecuteTransferFallback(userId, request);
        }

        private async Task<TransferResult> ExecuteTransferFallback(Guid userId, AccountTransferRequest request)
        {
            try
            {
                var incomeRepo = new SupabaseRepository<Income>(_supabaseRepository.GetClient());
                var userIncomes = await incomeRepo.GetByUserIdAsync(userId) ?? new List<Income>();

                var fromAccount = userIncomes.FirstOrDefault(i => i.id == request.from_income_id && i.user_id == userId);
                var toAccount = userIncomes.FirstOrDefault(i => i.id == request.to_income_id && i.user_id == userId);

                if (fromAccount == null || toAccount == null)
                {
                    return new TransferResult
                    {
                        success = false,
                        message = "Source or destination account not found or unauthorized."
                    };
                }

                double fromBalance = fromAccount.balance ?? 0;
                if (fromBalance < request.amount)
                {
                    return new TransferResult
                    {
                        success = false,
                        message = $"Insufficient balance in source account {fromAccount.source} (Available: ₹{fromBalance:N2}, Required: ₹{request.amount:N2}).",
                        from_account_new_balance = fromBalance,
                        to_account_new_balance = toAccount.balance ?? 0
                    };
                }

                fromAccount.balance = fromBalance - request.amount;
                fromAccount.updated_at = DateTime.UtcNow;
                await incomeRepo.UpdateAsync(fromAccount);

                toAccount.balance = (toAccount.balance ?? 0) + request.amount;
                toAccount.updated_at = DateTime.UtcNow;
                await incomeRepo.UpdateAsync(toAccount);

                var transferRecord = new AccountTransfer
                {
                    id = Guid.NewGuid(),
                    user_id = userId,
                    from_income_id = request.from_income_id,
                    to_income_id = request.to_income_id,
                    amount = request.amount,
                    description = request.description ?? "Account Transfer",
                    transferred_on = DateTime.UtcNow,
                    created_at = DateTime.UtcNow
                };

                try
                {
                    await _supabaseRepository.CreateAsync(transferRecord);
                }
                catch (Exception createEx)
                {
                    Console.WriteLine($"[AccountTransfer Record Create Warning]: {createEx.Message}");
                }

                return new TransferResult
                {
                    success = true,
                    message = "Transfer completed successfully.",
                    transfer_id = transferRecord.id,
                    from_account_new_balance = fromAccount.balance.Value,
                    to_account_new_balance = toAccount.balance.Value
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ExecuteTransferFallback Error]: {ex.Message}");
                return new TransferResult
                {
                    success = false,
                    message = $"Transfer failed: {ex.Message}"
                };
            }
        }

        public async Task<List<AccountTransferDetails>> GetTransfersFromDB(Guid userId)
        {
            try
            {
                var userTransfers = await _supabaseRepository.GetByUserIdAsync(userId) ?? new List<AccountTransfer>();
                userTransfers = userTransfers.Where(t => t.user_id == userId).ToList();

                var incomeRepo = new SupabaseRepository<Income>(_supabaseRepository.GetClient());
                var userIncomes = await incomeRepo.GetByUserIdAsync(userId) ?? new List<Income>();
                var incomeDict = userIncomes.ToDictionary(i => i.id, i => i.source ?? "Unknown Account");

                return userTransfers.Select(t => new AccountTransferDetails
                {
                    id = t.id,
                    from_income_id = t.from_income_id,
                    from_account_name = incomeDict.TryGetValue(t.from_income_id, out var fromName) ? fromName : "Unknown Account",
                    to_income_id = t.to_income_id,
                    to_account_name = incomeDict.TryGetValue(t.to_income_id, out var toName) ? toName : "Unknown Account",
                    amount = t.amount,
                    description = t.description,
                    transferred_on = t.transferred_on
                }).OrderByDescending(t => t.transferred_on).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AccountTransferDL GetTransfers Warning]: {ex.Message}");
                return new List<AccountTransferDetails>();
            }
        }
    }
}
