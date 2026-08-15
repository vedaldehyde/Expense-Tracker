using System;
using System.ComponentModel.DataAnnotations.Schema;
using Postgrest.Attributes;
using Postgrest.Models;

namespace Models
{
    [Postgrest.Attributes.Table("savings_history")]
    public class SavingsHistory : BaseModel
    {
        [Postgrest.Attributes.PrimaryKey("id", false)]
        public Guid id { get; set; }

        [Postgrest.Attributes.Column("user_id")]
        public Guid? user_id { get; set; }

        [Postgrest.Attributes.Column("budget_id")]
        public Guid? budget_id { get; set; }

        [Postgrest.Attributes.Column("saved_amount")]
        public double saved_amount { get; set; }

        [Postgrest.Attributes.Column("credited_on")]
        public DateTime credited_on { get; set; }

        [Postgrest.Attributes.Column("description")]
        public string? description { get; set; }

        [Postgrest.Attributes.Column("transaction_type")]
        public string? transaction_type { get; set; }

        [Postgrest.Attributes.Column("related_expense_id")]
        public Guid? related_expense_id { get; set; }

        [Postgrest.Attributes.Column("created_at")]
        public DateTime created_at { get; set; }
    }

    public class SavingsHistoryRequest
    {
        public Guid budget_id { get; set; }
        public double? amount { get; set; }
        public string? description { get; set; }
    }

    public class SavingsContributionRequest
    {
        public Guid budget_id { get; set; }
        public double amount { get; set; }
        public DateTime? credited_on { get; set; }
        public string? description { get; set; }
    }

    public class ContributionResult
    {
        public bool success { get; set; }
        public string? message { get; set; }
        public double saved_amount { get; set; }
        public double remaining_goal { get; set; }
        public double new_income_balance { get; set; }
    }

    public class TotalSavingsResponse
    {
        public double total_savings { get; set; }
    }

    public class UnallocatedSavingsResponse
    {
        public double unallocated_savings { get; set; }
    }
}