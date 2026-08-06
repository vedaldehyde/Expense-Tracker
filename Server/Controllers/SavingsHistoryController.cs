using Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class SavingsHistoryController : ControllerBase
    {
        private readonly ISavingsHistoryBL _savingsBL ;
        public SavingsHistoryController(ISavingsHistoryBL savingsHistoryBL)
        {
            _savingsBL = savingsHistoryBL;
        }
        [HttpPost("CreateSavingsHistory")]
        public async Task<IActionResult> CreateSavingsHistory([FromBody] SavingsHistoryRequest request)
        {
            await _savingsBL.CreateSavingsHistoryAsync(request);
            return Ok(new { message = "Savings credited" });
        }
    }
}