namespace Models
{
    public class AIRecommendationRequest
    {
        public int? month { get; set; }
        public int? year { get; set; }
    }

    public class AIInsightItem
    {
        public string category { get; set; } = string.Empty;
        public string title { get; set; } = string.Empty;
        public string description { get; set; } = string.Empty;
        public string impact_level { get; set; } = "medium"; // high, medium, low
        public double? amount { get; set; }
    }

    public class AIRecommendationResponse
    {
        public int financial_health_score { get; set; } = 85;
        public string summary { get; set; } = string.Empty;
        public List<AIInsightItem> where_to_spend { get; set; } = new();
        public List<AIInsightItem> where_to_save { get; set; } = new();
        public List<AIInsightItem> budget_alerts { get; set; } = new();
        public List<string> smart_tips { get; set; } = new();
    }

    public class AIChatMessage
    {
        public string role { get; set; } = "user";
        public string content { get; set; } = string.Empty;
    }

    public class AIChatRequest
    {
        public string message { get; set; } = string.Empty;
        public List<AIChatMessage>? history { get; set; }
    }

    public class AIChatResponse
    {
        public string reply { get; set; } = string.Empty;
        public DateTime timestamp { get; set; } = DateTime.UtcNow;
        public List<string> suggested_prompts { get; set; } = new();
    }
}
