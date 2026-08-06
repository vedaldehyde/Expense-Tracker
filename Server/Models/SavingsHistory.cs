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
        public Guid user_id { get; set; }

        [Postgrest.Attributes.Column("budget_id")]
        public Guid budget_id { get; set; }

        [Postgrest.Attributes.Column("saved_amount")]
        public double saved_amount { get; set; }

        [Postgrest.Attributes.Column("credited_on")]
        public DateTime credited_on { get; set; }

        [Postgrest.Attributes.Column("description")]
        public string? description { get; set; }

        [Postgrest.Attributes.Column("created_at")]
        public DateTime created_at { get; set; }
    }

    public class SavingsHistoryRequest
    {
        public Guid budget_id { get; set; }
    }
}