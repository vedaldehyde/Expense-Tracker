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

        [Column("start_date")]
        public DateTime start_date { get; set; }

        [Column("end_date")]
        public DateTime end_date { get; set; }

        [Column("target_amount")]
        public double target_amount { get; set; }

        [Column("is_active")]
        public bool is_active { get; set; }

        [Column("created_at")]
        public DateTime? created_at { get; set; }

    }
    
    public class BudgetRequest
    {
        public DateTime start_date { get; set; }
        public DateTime end_date { get; set; }
        public double target_amount { get; set; }

    }
}