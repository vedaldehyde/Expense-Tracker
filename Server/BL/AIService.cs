using System.Text;
using System.Text.Json;
using Interfaces;
using Models;

namespace BL
{
    public class AIService : IAIService
    {
        private readonly IExpenseDL _expenseDL;
        private readonly IIncomeDL _incomeDL;
        private readonly IBudgetDL _budgetDL;
        private readonly ICategoriesDL _categoriesDL;
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;

        public AIService(
            IExpenseDL expenseDL,
            IIncomeDL incomeDL,
            IBudgetDL budgetDL,
            ICategoriesDL categoriesDL,
            IConfiguration config,
            HttpClient httpClient)
        {
            _expenseDL = expenseDL;
            _incomeDL = incomeDL;
            _budgetDL = budgetDL;
            _categoriesDL = categoriesDL;
            _config = config;
            _httpClient = httpClient;
        }

        public async Task<AIRecommendationResponse> GetRecommendationsAsync(Guid userId, AIRecommendationRequest request)
        {
            var expenses = await _expenseDL.GetExpensesFromDB(userId) ?? new List<ExpenseDetails>();
            var incomeData = await _incomeDL.GetIncomesFromDB(userId) ?? new IncomeResponse();
            var budgets = await _budgetDL.GetBudgetsFromDB(userId) ?? new List<BudgetDetails>();

            double totalIncome = incomeData.total_balance;
            double totalSpent = expenses.Sum(e => e.amount ?? 0);
            
            // Group expenses by category
            var categoryBreakdown = expenses
                .Where(e => !string.IsNullOrEmpty(e.category_type))
                .GroupBy(e => e.category_type!)
                .ToDictionary(g => g.Key, g => g.Sum(e => e.amount ?? 0));

            // Try Google Gemini API if key is available or try public AI prompt
            var apiKey = _config["GeminiApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");

            if (!string.IsNullOrEmpty(apiKey))
            {
                try
                {
                    var geminiResult = await CallGeminiApiAsync(apiKey, totalIncome, totalSpent, categoryBreakdown, budgets, expenses);
                    if (geminiResult != null)
                    {
                        return geminiResult;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[AIService] Gemini API call failed, falling back to smart rule engine: {ex.Message}");
                }
            }

            // Fallback: Smart AI Heuristic Recommendation Engine
            return GenerateSmartRuleRecommendations(totalIncome, totalSpent, categoryBreakdown, budgets, expenses);
        }

        private async Task<AIRecommendationResponse?> CallGeminiApiAsync(
            string apiKey,
            double totalIncome,
            double totalSpent,
            Dictionary<string, double> categoryBreakdown,
            List<BudgetDetails> budgets,
            List<ExpenseDetails> expenses)
        {
            var prompt = $@"
You are a financial coach. Analyze the user's financial status and return a strict JSON response with no markdown formatting.
Financial Overview:
- Total Income: ₹{totalIncome}
- Total Expenses: ₹{totalSpent}
- Category Expenses: {JsonSerializer.Serialize(categoryBreakdown)}
- Budgets: {JsonSerializer.Serialize(budgets.Select(b => new { b.budget_name, b.budget_amount, b.spent_amount, b.remaining_amount, b.budget_status }))}
- Recent Expenses: {JsonSerializer.Serialize(expenses.Take(10).Select(e => new { e.title, e.amount, e.category_type }))}

Respond strictly in JSON format matching this schema:
{{
  ""financial_health_score"": 85,
  ""summary"": ""Short summary of financial health"",
  ""where_to_spend"": [
    {{ ""category"": ""Utilities"", ""title"": ""Essential Bills"", ""description"": ""Keep allocating funds for mandatory bills"", ""impact_level"": ""low"", ""amount"": 500.0 }}
  ],
  ""where_to_save"": [
    {{ ""category"": ""Dining"", ""title"": ""Reduce Restaurant Meals"", ""description"": ""You spent 35% of income on eating out."", ""impact_level"": ""high"", ""amount"": 1200.0 }}
  ],
  ""budget_alerts"": [
    {{ ""category"": ""Shopping"", ""title"": ""Near Budget Limit"", ""description"": ""You have reached 90% of budget."", ""impact_level"": ""high"", ""amount"": 2500.0 }}
  ],
  ""smart_tips"": [
    ""Tip 1"", ""Tip 2""
  ]
}}";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";
            var response = await _httpClient.PostAsync(url, new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"));

            if (!response.IsSuccessStatusCode) return null;

            var jsonString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(jsonString);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrEmpty(text)) return null;

            // Clean code block ticks if present
            var cleanedJson = text.Trim();
            if (cleanedJson.StartsWith("```json")) cleanedJson = cleanedJson.Substring(7);
            if (cleanedJson.StartsWith("```")) cleanedJson = cleanedJson.Substring(3);
            if (cleanedJson.EndsWith("```")) cleanedJson = cleanedJson.Substring(0, cleanedJson.Length - 3);
            cleanedJson = cleanedJson.Trim();

            return JsonSerializer.Deserialize<AIRecommendationResponse>(cleanedJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }

        private AIRecommendationResponse GenerateSmartRuleRecommendations(
            double totalIncome,
            double totalSpent,
            Dictionary<string, double> categoryBreakdown,
            List<BudgetDetails> budgets,
            List<ExpenseDetails> expenses)
        {
            if (expenses.Count == 0 && totalIncome <= 0)
            {
                return new AIRecommendationResponse
                {
                    financial_health_score = 0,
                    summary = "Welcome to SpendWise AI! Add your income and expenses to unlock personalized financial insights and recommendations.",
                    where_to_save = new List<AIInsightItem>(),
                    where_to_spend = new List<AIInsightItem>(),
                    budget_alerts = new List<AIInsightItem>(),
                    smart_tips = new List<string>
                    {
                        "Start by creating your first budget or logging an income source.",
                        "Track expenses daily to build healthy financial habits.",
                        "Follow the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings."
                    }
                };
            }

            var response = new AIRecommendationResponse();
            double savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;
            
            // Calculate score (0 to 100)
            int score = 70;
            if (savingsRate > 30) score += 20;
            else if (savingsRate > 15) score += 10;
            else if (savingsRate < 0) score -= 30;
            else if (savingsRate < 10) score -= 15;

            response.financial_health_score = Math.Clamp(score, 10, 100);

            // Summary
            if (totalIncome <= 0)
            {
                response.summary = "Add your income sources to get complete AI budget guidance and savings optimization.";
            }
            else if (savingsRate < 0)
            {
                response.summary = $"Warning: Your spending exceeds your income by ₹{Math.Abs(totalIncome - totalSpent):N2}. Immediate cost reduction is recommended.";
            }
            else
            {
                response.summary = $"Your overall financial health is steady. You are currently saving {savingsRate:F1}% of your total balance.";
            }

            // Where to Save (High expense categories, over-budget areas)
            var topSpentCategory = categoryBreakdown.OrderByDescending(c => c.Value).FirstOrDefault();
            if (!string.IsNullOrEmpty(topSpentCategory.Key) && topSpentCategory.Value > 0)
            {
                response.where_to_save.Add(new AIInsightItem
                {
                    category = topSpentCategory.Key,
                    title = $"Trim High Spending in {topSpentCategory.Key}",
                    description = $"You have spent ₹{topSpentCategory.Value:N2} in {topSpentCategory.Key}. Reducing this by 15% could save you ₹{(topSpentCategory.Value * 0.15):N2} monthly.",
                    impact_level = "high",
                    amount = topSpentCategory.Value * 0.15
                });
            }

            if (totalSpent > totalIncome * 0.7 && totalIncome > 0)
            {
                response.where_to_save.Add(new AIInsightItem
                {
                    category = "General Savings",
                    title = "Establish emergency reserve",
                    description = "Your spending accounts for over 70% of total income. Aim to set aside at least 20% in high-yield savings.",
                    impact_level = "high",
                    amount = totalIncome * 0.20
                });
            }

            // Budget Alerts
            foreach (var budget in budgets)
            {
                if (budget.spending_percentage >= 90)
                {
                    response.budget_alerts.Add(new AIInsightItem
                    {
                        category = budget.budget_name ?? "Budget",
                        title = $"Critical: {budget.budget_name} near limit",
                        description = $"Used {budget.spending_percentage:F0}% of target (₹{budget.spent_amount:N2} / ₹{budget.budget_amount:N2}).",
                        impact_level = "high",
                        amount = budget.remaining_amount
                    });
                }
                else if (budget.spending_percentage >= 75)
                {
                    response.budget_alerts.Add(new AIInsightItem
                    {
                        category = budget.budget_name ?? "Budget",
                        title = $"Warning: {budget.budget_name} usage high",
                        description = $"You have reached {budget.spending_percentage:F0}% of your set budget limit.",
                        impact_level = "medium",
                        amount = budget.remaining_amount
                    });
                }
            }

            // Where to Spend (Safe allocations & essentials)
            if (totalIncome > totalSpent)
            {
                double surplus = totalIncome - totalSpent;
                response.where_to_spend.Add(new AIInsightItem
                {
                    category = "Investments & SIP",
                    title = "Allocate surplus towards growth",
                    description = $"You have a net surplus of ₹{surplus:N2}. Consider putting ₹{(surplus * 0.4):N2} into systematic investments or retirement index funds.",
                    impact_level = "medium",
                    amount = surplus * 0.4
                });

                response.where_to_spend.Add(new AIInsightItem
                {
                    category = "Skill & Personal Growth",
                    title = "Essential Self Development",
                    description = "Allocate up to 5% of monthly balance towards courses, certifications, or tools.",
                    impact_level = "low",
                    amount = totalIncome * 0.05
                });
            }
            else
            {
                response.where_to_spend.Add(new AIInsightItem
                {
                    category = "Essentials Only",
                    title = "Freeze Non-Essential Expenses",
                    description = "Focus all current income strictly on essential groceries, rent, and utility bills.",
                    impact_level = "high"
                });
            }

            // Smart Tips
            response.smart_tips.Add("Follow the 50/30/20 rule: 50% Needs, 30% Wants, 20% Savings.");
            response.smart_tips.Add("Automate monthly transfers to your savings account right on pay-day.");
            response.smart_tips.Add("Review subscriptions every quarter to eliminate unused recurring services.");

            return response;
        }

        public async Task<AIChatResponse> AskAICoachAsync(Guid userId, AIChatRequest request)
        {
            var userMsg = request.message?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(userMsg))
            {
                return new AIChatResponse
                {
                    reply = "Hello! I'm your SpendWise AI Financial Coach. Ask me anything about your budgets, savings goals, category spending, or financial habits!",
                    suggested_prompts = new List<string>
                    {
                        "How can I save ₹10,000 more this month?",
                        "What is my highest spending category?",
                        "How does fixed bill isolation work?"
                    }
                };
            }

            List<ExpenseDetails> expenses = new();
            IncomeResponse incomeData = new();
            List<BudgetDetails> budgets = new();

            try { expenses = await _expenseDL.GetExpensesFromDB(userId) ?? new List<ExpenseDetails>(); } catch (Exception ex) { Console.WriteLine($"[AIService ExpenseDL Error]: {ex.Message}"); }
            try { incomeData = await _incomeDL.GetIncomesFromDB(userId) ?? new IncomeResponse(); } catch (Exception ex) { Console.WriteLine($"[AIService IncomeDL Error]: {ex.Message}"); }
            try { budgets = await _budgetDL.GetBudgetsFromDB(userId) ?? new List<BudgetDetails>(); } catch (Exception ex) { Console.WriteLine($"[AIService BudgetDL Error]: {ex.Message}"); }

            double totalIncome = incomeData.total_balance;
            double totalSpent = expenses.Sum(e => e.amount ?? 0);
            var categoryBreakdown = expenses
                .Where(e => !string.IsNullOrEmpty(e.category_type))
                .GroupBy(e => e.category_type!)
                .ToDictionary(g => g.Key, g => g.Sum(e => e.amount ?? 0));

            var topSpentCategory = categoryBreakdown.OrderByDescending(c => c.Value).FirstOrDefault();
            var activeRegular = budgets.FirstOrDefault(b => (b.budget_type?.ToLower() == "regular" || string.IsNullOrEmpty(b.budget_type)) && (b.is_active || b.budget_status == "Active"));
            var savingsGoals = budgets.Where(b => b.budget_type?.ToLower() == "savings").ToList();

            var apiKey = _config["GeminiApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
            if (!string.IsNullOrEmpty(apiKey))
            {
                try
                {
                    var geminiReply = await CallGeminiChatApiAsync(apiKey, userMsg, totalIncome, totalSpent, categoryBreakdown, budgets, expenses);
                    if (!string.IsNullOrEmpty(geminiReply))
                    {
                        return new AIChatResponse
                        {
                            reply = geminiReply,
                            suggested_prompts = GetContextualPrompts(userMsg)
                        };
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[AIService] Gemini chat API call failed: {ex.Message}");
                }
            }

            // Conversational Rule Engine Fallback
            string responseText = GenerateConversationalAnswer(userMsg, totalIncome, totalSpent, categoryBreakdown, topSpentCategory, activeRegular, savingsGoals);

            return new AIChatResponse
            {
                reply = responseText,
                timestamp = DateTime.UtcNow,
                suggested_prompts = GetContextualPrompts(userMsg)
            };
        }

        private async Task<string?> CallGeminiChatApiAsync(
            string apiKey,
            string userMessage,
            double totalIncome,
            double totalSpent,
            Dictionary<string, double> categoryBreakdown,
            List<BudgetDetails> budgets,
            List<ExpenseDetails> expenses)
        {
            var prompt = $@"
You are SpendWise AI, a friendly, highly intelligent financial coach assisting a user.
User Question: ""{userMessage}""

Financial Context:
- Total Balance/Income: ₹{totalIncome}
- Total Expenses: ₹{totalSpent}
- Category Breakdown: {JsonSerializer.Serialize(categoryBreakdown)}
- Active Budgets: {JsonSerializer.Serialize(budgets.Select(b => new { b.budget_name, b.budget_type, b.budget_amount, b.spent_amount, b.remaining_amount, b.budget_status }))}
- Recent Expenses: {JsonSerializer.Serialize(expenses.Take(8).Select(e => new { e.title, e.amount, e.category_type }))}

Provide a concise, friendly, and practical response formatted cleanly. Use clear bullet points and exact rupee figures where appropriate.";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";
            var response = await _httpClient.PostAsync(url, new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json"));

            if (!response.IsSuccessStatusCode) return null;

            var jsonString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(jsonString);
            return doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();
        }

        private string GenerateConversationalAnswer(
            string query,
            double totalIncome,
            double totalSpent,
            Dictionary<string, double> categoryBreakdown,
            KeyValuePair<string, double> topSpentCategory,
            BudgetDetails? activeRegular,
            List<BudgetDetails> savingsGoals)
        {
            var q = query.ToLower();
            double netAvailable = Math.Max(0, totalIncome - totalSpent);

            // 1. Greetings & Small Talk
            if (q.Contains("how are you") || q.Contains("how r u") || q.Contains("how do you do"))
            {
                return "😊 **I'm doing fantastic, thank you for asking!**\n\nI'm your SpendWise AI Financial Coach. I'm actively analyzing your balance, expenses, and budgets to help you reach your goals. How can I assist you with your money plans today?";
            }
            if (q.StartsWith("hi") || q.StartsWith("hello") || q.StartsWith("hey") || q.Contains("who are you") || q.Contains("what can you do"))
            {
                return $"👋 **Hello! Welcome to SpendWise AI Financial Coaching.**\n\nHere is your quick snapshot:\n• **Current Net Balance:** ₹{netAvailable:N0}\n• **Total Expenses Logged:** ₹{totalSpent:N0}\n\nAsk me anything like:\n• *'I want to buy a car in December, how will I manage my expenses?'*\n• *'What is my highest spending category?'*\n• *'How does fixed bill isolation work?'*";
            }

            // 2. Specific Car & Major Purchase Planning (e.g. MG Windsor PRO / December Target)
            if (q.Contains("car") || q.Contains("mg windsor") || q.Contains("vehicle") || (q.Contains("december") && q.Contains("buy")))
            {
                return $"🚗 **Financial Plan for Your Car Goal (e.g. MG Windsor PRO in December):**\n\nTo manage your expenses and buy your target car by December 2026 (~4 months away):\n\n1. **Create a Savings Goal Tracker:**\n   • Open **Budgets ➔ Create Budget**, choose **Savings Goal Tracker**.\n   • Set **Target Amount** (e.g. ₹3,00,000 down-payment or total goal).\n   • Set **Target Date** to **24 Nov 2026 / Dec 2026** and **Frequency = Monthly**.\n   • SpendWise AI will calculate your exact required monthly contribution (e.g. ₹75,000/month).\n\n2. **Isolate Monthly Fixed Bills:**\n   • Keep Home Rent (₹50,000) and mandatory EMIs stored under Fixed Expenses. They will NOT count against your daily variable budget limit.\n\n3. **Trim High Variable Spending:**\n   " + (!string.IsNullOrEmpty(topSpentCategory.Key) && topSpentCategory.Value > 0 
                    ? $"• Your highest variable spending is in **{topSpentCategory.Key}** (₹{topSpentCategory.Value:N0}). Cutting this by 15% frees up ₹{(topSpentCategory.Value * 0.15):N0} extra every month towards your car fund!" 
                    : "• Cap non-essential dining and shopping at 30% of your total balance.") + 
                    $"\n\n4. **Current Status:** You have a net available balance of **₹{netAvailable:N0}**. Setting up your Savings Goal now will keep you right on track for December delivery!";
            }

            // 3. Affordability & Purchase Decision Questions
            if (q.Contains("can i buy") || q.Contains("can i afford") || q.Contains("should i buy") || q.Contains("manage my expenses"))
            {
                return $"💳 **Affordability & Expense Management Strategy:**\n\nYes, with structured budget control you can comfortably achieve major purchases!\n\n• **Net Available Balance:** ₹{netAvailable:N0}\n• **Step 1:** Create a **Savings Goal Tracker** for the required down-payment or target amount.\n• **Step 2:** Use a **Regular Budget** to limit daily variable spending, while keeping Rent & fixed bills isolated.\n• **Step 3:** Deposit remaining surplus into your Savings Vault each month.";
            }

            // 4. Savings Advice
            if (q.Contains("save") || q.Contains("saving") || q.Contains("reduce"))
            {
                if (!string.IsNullOrEmpty(topSpentCategory.Key) && topSpentCategory.Value > 0)
                {
                    double potentialSave = topSpentCategory.Value * 0.15;
                    return $"💡 **Personalized Savings Strategy:**\n\nYour highest expenditure is currently in **{topSpentCategory.Key}** at **₹{topSpentCategory.Value:N0}**.\n\n• **Action Plan:** Reducing this single category by 15% will save you **₹{potentialSave:N0}** every month.\n• **Budgeting Tip:** Allocate a dedicated monthly limit for {topSpentCategory.Key} and set a warning alert at 80% usage.\n• **Net Balance:** You currently have a net balance of ₹{netAvailable:N0}.";
                }
                return $"💡 **Savings Advice:** To increase your monthly savings, follow the **50/30/20 Rule**:\n• **50% Needs:** Groceries, utilities, rent.\n• **30% Wants:** Dining, entertainment, shopping.\n• **20% Savings:** Transfer directly to high-yield savings or mutual fund SIPs.";
            }

            // 5. Category Breakdown
            if (q.Contains("category") || q.Contains("highest") || q.Contains("top spend") || q.Contains("where does my money go"))
            {
                if (!string.IsNullOrEmpty(topSpentCategory.Key))
                {
                    double percentage = totalSpent > 0 ? (topSpentCategory.Value / totalSpent) * 100 : 0;
                    return $"📊 **Spending Category Breakdown:**\n\nYour top spending category is **{topSpentCategory.Key}**, accounting for **{percentage:F1}%** of all expenses (₹{topSpentCategory.Value:N0}).\n\nTotal recorded spending across all categories is **₹{totalSpent:N0}**.";
                }
                return "📊 You haven't logged any category expenses yet. Add expenses to view a detailed breakdown!";
            }

            // 6. Fixed Expense Isolation
            if (q.Contains("rent") || q.Contains("fixed") || q.Contains("bill") || q.Contains("isolation"))
            {
                return "🛡️ **Fixed Expense Isolation Rule:**\n\nIn SpendWise AI, recurring bills like **Home Rent, Gym, and Insurance** are saved as itemized Fixed Expenses.\n\n• **Why?** Fixed expenses are mandatory obligations and are excluded from your regular variable spending limit. This prevents ₹50,000 rent from triggering false 'Overspent' warnings on your daily shopping budget!";
            }

            // 7. Regular Budget Status
            if (q.Contains("regular") || q.Contains("budget"))
            {
                if (activeRegular != null)
                {
                    return $"🎯 **Active Regular Budget Status:**\n\n• **Budget Limit:** ₹{activeRegular.budget_amount:N0}\n• **Variable Spent:** ₹{activeRegular.spent_amount:N0}\n• **Remaining Allowance:** ₹{activeRegular.remaining_amount:N0}\n• **Status:** {activeRegular.budget_status}";
                }
                return "🎯 You currently don't have an active Regular Budget. Click **+ Configure Budget** on the dashboard to set a variable spending limit!";
            }

            // 8. Savings Goal Tracker Progress
            if (q.Contains("goal") || q.Contains("savings tracker"))
            {
                if (savingsGoals.Count > 0)
                {
                    var g = savingsGoals.First();
                    return $"🚀 **Savings Goal Progress ({g.budget_name}):**\n\n• **Target Goal:** ₹{g.target_amount:N0}\n• **Saved So Far:** ₹{g.spent_amount:N0}\n• **Recommended Contribution:** ₹{g.budget_amount:N0} ({g.frequency})\n• **Remaining to Goal:** ₹{g.remaining_amount:N0}";
                }
                return "🚀 **Savings Goal Trackers:** Create a Savings Goal to track progress toward a specific target (e.g. New Car, Wedding, Emergency Reserve). You'll get exact non-fractional contribution recommendations!";
            }

            // 9. Conversational Default
            return $"🤖 **SpendWise Financial Assistant:**\n\n• **Total Income Balance:** ₹{totalIncome:N0}\n• **Total Expenses:** ₹{totalSpent:N0}\n• **Net Available:** ₹{netAvailable:N0}\n\nI can help you plan major purchases (e.g. buying a car), optimize savings goals, or analyze your spending categories. What would you like to explore next?";
        }

        private List<string> GetContextualPrompts(string query)
        {
            var q = query.ToLower();
            if (q.Contains("save"))
            {
                return new List<string>
                {
                    "What is my highest spending category?",
                    "How does fixed bill isolation work?",
                    "Show my active budget status"
                };
            }
            return new List<string>
            {
                "How can I save ₹10,000 more this month?",
                "Show top category breakdown",
                "Explain fixed expense isolation"
            };
        }
    }
}

