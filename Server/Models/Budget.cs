using Postgrest.Attributes;
using Postgrest.Models;
using System;
using System.Collections.Generic;

namespace Models
{
    [Table("budget")]
    public class Budget : BaseModel
    {
        [PrimaryKey("id", false)]
        public Guid id { get; set; }

        [Column("income_id")]
        public Guid? income_id { get; set; }

        [Column("user_id")]
        public Guid? user_id { get; set; }

        [Column("budget_name")]
        public string? budget_name { get; set; }

        [Column("budget_type")]
        public string? budget_type { get; set; }

        [Column("frequency")]
        public string? frequency { get; set; }

        [Column("start_date")]
        public DateTime start_date { get; set; }

        [Column("end_date")]
        public DateTime end_date { get; set; }

        [Column("target_amount")]
        public double target_amount { get; set; }

        [Column("budget_amount")]
        public double budget_amount { get; set; }

        [Column("variable_expense")]
        public double variable_expense { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; }

        [Column("is_savings_credited")]
        public bool is_savings_credited { get; set; }

        [Column("created_at")]
        public DateTime created_at { get; set; }
    }

    public class BudgetRequest
    {
        public Guid income_id { get; set; }
        public string? budget_name { get; set; }
        public string? budget_type { get; set; }
        public string? budget_frequency { get; set; }
        public DateTime start_date { get; set; }
        public DateTime end_date { get; set; }
        public double target_amount { get; set; }
        public double budget_amount { get; set; }
        public List<FixedExpenses>? fixedExpenses { get; set; }
        public double variableExpenses { get; set; }
    }

    public class BudgetDetails
    {
        public Guid budget_id { get; set; }
        public string? budget_name { get; set; }
        public string? budget_type { get; set; }
        public string? frequency { get; set; }
        public string? income_source { get; set; }
        public DateOnly start_date { get; set; }
        public DateOnly end_date { get; set; }
        public double budget_amount { get; set; }
        public double target_amount { get; set; }
        public double spent_amount { get; set; }
        public double remaining_amount { get; set; }
        public double saved_amount { get; set; }
        public double spending_percentage { get; set; }
        public string? budget_status { get; set; }
        public bool target_achieved { get; set; }
        public bool is_active { get; set; }
        public Guid income_id { get; set; }
        public bool is_savings_credited { get; set; }
        public double variable_expense { get; set; }
        public double fixed_expense { get; set; }
    }

    public class BudgetIdResponse
    {
        public Guid Id { get; set; }
    }
}