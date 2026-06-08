using Interfaces;
using Models;

namespace BL
{
    public class BudgetBL : IBudgetBL
    {
        private readonly IBudgetDL _budgetDL;
        public BudgetBL(IBudgetDL budgetDL)
        {
            _budgetDL = budgetDL;
        }
        
        public async Task CreateBudgetAsync(BudgetRequest request)
        {
            try
            {
                await _budgetDL.CreateBudgetInDB(request);
            }
            catch (Exception e)
            {
               System.Console.WriteLine(e.Message.ToString());
            }
        }
    }
}