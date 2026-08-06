using DL;
using Interfaces;
using Models;

namespace BL
{
    public class SavingsHistoryBL : ISavingsHistoryBL
    {
        private readonly ISavingsHistoryDL _savingsHistoryDL;
        private readonly IBudgetDL _budgetDL;

        public SavingsHistoryBL(ISavingsHistoryDL savingsHistoryDL, IBudgetDL budgetDL)
        {
            _budgetDL = budgetDL;
            _savingsHistoryDL = savingsHistoryDL;
        }

        public async Task CreateSavingsHistoryAsync(SavingsHistoryRequest request)
        {
            try
            {
                var dashboard = await _budgetDL.GetBudgetsFromDB();
                if (dashboard == null)
                    return;

                var savedBudget = dashboard.Find(budget => budget.budget_id == request.budget_id);


                // Check budget completion / overspent

                if (savedBudget?.budget_status?.ToUpper() != "COMPLETED" && savedBudget?.is_active == false)
                {
                    return;
                }

                double savingsAmount = Convert.ToDouble(savedBudget?.budget_amount)  - Convert.ToDouble(savedBudget?.spent_amount);

                if (savingsAmount <= 0)
                    return;



                var savingsHistory = new SavingsHistory
                {
                    user_id = Guid.Parse("a54182db-cb26-4f43-abb7-abad3c04e6f5"),
                    budget_id = request.budget_id,
                    saved_amount = savingsAmount,
                    credited_on = DateTime.UtcNow,
                    created_at = DateTime.UtcNow
                };
                await _savingsHistoryDL.CreateSavingsHistoryInDB(savingsHistory);
                await _budgetDL.UpdateBudgetSavingsStatus(request.budget_id);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
        }
    }
}