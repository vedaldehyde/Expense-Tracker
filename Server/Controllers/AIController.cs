using Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;

        public AIController(IAIService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("GetRecommendations")]
        public async Task<IActionResult> GetRecommendations([FromBody] AIRecommendationRequest? request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
                var userId = Guid.Parse(userIdClaim);

                request ??= new AIRecommendationRequest();
                var result = await _aiService.GetRecommendationsAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AIController GetRecommendations Error]: {ex.Message}");
                return Ok(new AIRecommendationResponse
                {
                    financial_health_score = 75,
                    summary = "SpendWise AI is actively tracking your budget overview. Log new expenses or incomes to generate tailored insights."
                });
            }
        }

        [HttpPost("Chat")]
        public async Task<IActionResult> AskAICoach([FromBody] AIChatRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
                var userId = Guid.Parse(userIdClaim);

                var response = await _aiService.AskAICoachAsync(userId, request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AIController Chat Exception]: {ex.Message}\n{ex.StackTrace}");
                return Ok(new AIChatResponse
                {
                    reply = "I am ready to assist you with your financial questions. Feel free to ask about savings tips, category spending, or budget limits!",
                    timestamp = DateTime.UtcNow,
                    suggested_prompts = new List<string>
                    {
                        "How can I save ₹10,000 more this month?",
                        "What is my highest spending category?",
                        "Explain fixed expense isolation"
                    }
                });
            }
        }
    }
}
