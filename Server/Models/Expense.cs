using System.ComponentModel.DataAnnotations.Schema;
using Postgrest.Attributes;
using Postgrest.Models;

namespace Models
{
    [Postgrest.Attributes.Table("expense")]
    public class Expense : Postgrest.Models.BaseModel
    {
        [Postgrest.Attributes.PrimaryKey("id", false)]
        public Guid id { get; set; }

        [Postgrest.Attributes.Column("user_id")]
        public Guid? user_id { get; set; }

        [Postgrest.Attributes.Column("category_id")]
        public Guid? category_id { get; set; }

        [Postgrest.Attributes.Column("amount")]
        public double? amount { get; set; }

        [Postgrest.Attributes.Column("title")]
        public string? title { get; set; }

        [Postgrest.Attributes.Column("description")]
        public string? description { get; set; }

        [Postgrest.Attributes.Column("transaction_date")]
        public DateTime? transaction_date { get; set; }

        [Postgrest.Attributes.Column("payment_method")]
        public string? payment_method { get; set; }
    }

    public class ExpenseRequest
    {
        public string? category_id { get; set; }
        public string? title { get; set; }
        public double? amount { get; set; }
        public string? category { get; set; }
        public string? description { get; set; }
        public string? payment_method { get; set; }
        public DateTime date { get; set; }
    }

    public class ExpenseDetails
    {
        public Guid? expense_id { get; set; }
        public double? amount { get; set; }
        public string? category_type { get; set; }
        public string? description { get; set; }
        public string? title { get; set; }
        public DateTime? transaction_date { get; set; }
    }
}