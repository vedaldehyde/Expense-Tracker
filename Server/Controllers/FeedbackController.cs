using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;

namespace Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackBL _feedbackBL;

        public FeedbackController(IFeedbackBL feedbackBL)
        {
            _feedbackBL = feedbackBL;
        }

        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] FeedbackRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            try
            {
                await _feedbackBL.CreateFeedbackAsync(userId, request);
                return Created(string.Empty, new { message = "Thanks! Your feedback has been submitted." });
            }
            catch (ArgumentException argEx)
            {
                return BadRequest(new { message = argEx.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FeedbackController Create Error]: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while submitting feedback. Please try again." });
            }
        }

        [HttpGet("CheckAdmin")]
        public async Task<IActionResult> CheckAdmin()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            bool isAdmin = await _feedbackBL.IsUserAdminAsync(userId);
            return Ok(new { isAdmin });
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            try
            {
                var feedbackList = await _feedbackBL.GetAllFeedbackForAdminAsync(userId);
                return Ok(feedbackList);
            }
            catch (UnauthorizedAccessException uex)
            {
                return StatusCode(403, new { message = uex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FeedbackController GetAll Error]: {ex.Message}");
                return StatusCode(500, new { message = "Failed to retrieve feedback records." });
            }
        }

        [HttpPost("UpdateStatus")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateFeedbackStatusRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            try
            {
                await _feedbackBL.UpdateFeedbackStatusAsync(userId, request);
                return Ok(new { message = "Feedback status updated successfully." });
            }
            catch (UnauthorizedAccessException uex)
            {
                return StatusCode(403, new { message = uex.Message });
            }
            catch (ArgumentException aex)
            {
                return BadRequest(new { message = aex.Message });
            }
            catch (KeyNotFoundException kex)
            {
                return NotFound(new { message = kex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FeedbackController UpdateStatus Error]: {ex.Message}");
                return StatusCode(500, new { message = "Failed to update feedback status." });
            }
        }
    }
}
