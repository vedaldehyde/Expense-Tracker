using Models;

namespace Interfaces
{
    public interface IAIService
    {
        Task<AIRecommendationResponse> GetRecommendationsAsync(Guid userId, AIRecommendationRequest request);
        Task<AIChatResponse> AskAICoachAsync(Guid userId, AIChatRequest request);
    }
}
