using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using Interfaces;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AuditController : ControllerBase
    {
        private readonly ISupabaseRepository<Income> _incomeRepo;
        private readonly ISupabaseRepository<Budget> _budgetRepo;
        private readonly ISupabaseRepository<Expense> _expenseRepo;

        public AuditController(
            ISupabaseRepository<Income> incomeRepo,
            ISupabaseRepository<Budget> budgetRepo,
            ISupabaseRepository<Expense> expenseRepo)
        {
            _incomeRepo = incomeRepo;
            _budgetRepo = budgetRepo;
            _expenseRepo = expenseRepo;
        }

        [HttpGet("RunOwnershipAudit")]
        public async Task<IActionResult> RunOwnershipAudit()
        {
            try
            {
                var incomes = await _incomeRepo.GetAllAsync() ?? new List<Income>();
                var budgets = await _budgetRepo.GetAllAsync() ?? new List<Budget>();
                var expenses = await _expenseRepo.GetAllAsync() ?? new List<Expense>();

                var auditResults = new List<object>();
                int safeCount = 0;
                int conflictCount = 0;
                int noOwnerCount = 0;

                foreach (var inc in incomes)
                {
                    var budgetUserIds = budgets
                        .Where(b => b.income_id == inc.id && b.user_id.HasValue && b.user_id.Value != Guid.Empty)
                        .Select(b => b.user_id!.Value)
                        .Distinct()
                        .ToList();

                    var expenseUserIds = expenses
                        .Where(e => e.income_id == inc.id && e.user_id.HasValue && e.user_id.Value != Guid.Empty)
                        .Select(e => e.user_id!.Value)
                        .Distinct()
                        .ToList();

                    var allOwners = budgetUserIds.Union(expenseUserIds).Distinct().ToList();

                    string status;
                    Guid? resolvedUserId = null;

                    if (allOwners.Count == 1)
                    {
                        status = "SAFE_TO_BACKFILL";
                        resolvedUserId = allOwners.First();
                        safeCount++;
                    }
                    else if (allOwners.Count > 1)
                    {
                        status = "CONFLICTING_USERS";
                        conflictCount++;
                    }
                    else
                    {
                        status = "NO_OWNER_FOUND";
                        noOwnerCount++;
                    }

                    auditResults.Add(new
                    {
                        income_id = inc.id,
                        user_id_in_db = inc.user_id,
                        source = inc.source,
                        balance = inc.balance,
                        users_found_in_budget = budgetUserIds,
                        users_found_in_expense = expenseUserIds,
                        all_distinct_owners = allOwners,
                        resolved_user_id = resolvedUserId,
                        status = status
                    });
                }

                return Ok(new
                {
                    total_income_rows = incomes.Count,
                    safe_to_backfill_count = safeCount,
                    conflicting_users_count = conflictCount,
                    no_owner_found_count = noOwnerCount,
                    audit_passed = (conflictCount == 0 && noOwnerCount == 0),
                    results = auditResults
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
