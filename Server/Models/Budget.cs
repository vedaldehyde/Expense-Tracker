using Postgrest.Attributes;
using Postgrest.Models;

namespace Models
{
    [Table("budget")]
    public class Budget : BaseModel
    {
        [PrimaryKey("id", false)]
        public Guid id { get; set; }

        [Column("user_id")]
        public Guid user_id { get; set; }

        [Column("budget_name")]
        public string? budget_name { get; set; }

        [Column("start_date")]
        public DateTime start_date { get; set; }

        [Column("end_date")]
        public DateTime end_date { get; set; }

        [Column("target_amount")]
        public double target_amount { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; }

    }
    
    public class BudgetRequest
    {
        public string? budget_name { get; set; }
        public DateTime start_date { get; set; }
        public DateTime end_date { get; set; }
        public double target_amount { get; set; }

    }
    
    public class BudgetDetails
    {
        public Guid budget_id { get; set; }
        public double target_amount { get; set; }
        public DateOnly start_date { get; set; }
        public DateOnly end_date { get; set; }
        public string? status { get; set; }
        public double spent_amount { get; set; }
        public double remaining_amount { get; set; }
        public string? budget_name { get; set; }
    }
}