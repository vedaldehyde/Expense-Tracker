using Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountTransferController : ControllerBase
    {
        private readonly IAccountTransferBL _accountTransferBL;

        public AccountTransferController(IAccountTransferBL accountTransferBL)
        {
            _accountTransferBL = accountTransferBL;
        }

        [HttpPost("Transfer")]
        public async Task<IActionResult> Transfer([FromBody] AccountTransferRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            try
            {
                var result = await _accountTransferBL.TransferBetweenAccountsAsync(userId, request);

                if (!result.success)
                {
                    return BadRequest(new { message = result.message ?? "Transfer failed." });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AccountTransferController Error]: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetTransfers")]
        public async Task<IActionResult> GetTransfers()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = Guid.Parse(userIdClaim);

            try
            {
                var transfers = await _accountTransferBL.GetTransfersAsync(userId);
                return Ok(transfers);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AccountTransferController GetTransfers Error]: {ex.Message}");
                return Ok(new System.Collections.Generic.List<AccountTransferDetails>());
            }
        }
    }
}
