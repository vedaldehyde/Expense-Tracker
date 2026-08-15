using System;
using Postgrest.Attributes;
using Postgrest.Models;

namespace Models
{
    [Table("account_transfer")]
    public class AccountTransfer : BaseModel
    {
        [PrimaryKey("id", false)]
        public Guid id { get; set; }

        [Column("user_id")]
        public Guid? user_id { get; set; }

        [Column("from_income_id")]
        public Guid from_income_id { get; set; }

        [Column("to_income_id")]
        public Guid to_income_id { get; set; }

        [Column("amount")]
        public double amount { get; set; }

        [Column("description")]
        public string? description { get; set; }

        [Column("transferred_on")]
        public DateTime transferred_on { get; set; }

        [Column("created_at")]
        public DateTime created_at { get; set; }
    }

    public class AccountTransferRequest
    {
        public Guid from_income_id { get; set; }
        public Guid to_income_id { get; set; }
        public double amount { get; set; }
        public string? description { get; set; }
    }

    public class TransferResult
    {
        public bool success { get; set; }
        public string? message { get; set; }
        public Guid? transfer_id { get; set; }
        public double from_account_new_balance { get; set; }
        public double to_account_new_balance { get; set; }
    }

    public class AccountTransferDetails
    {
        public Guid id { get; set; }
        public Guid from_income_id { get; set; }
        public string from_account_name { get; set; } = string.Empty;
        public Guid to_income_id { get; set; }
        public string to_account_name { get; set; } = string.Empty;
        public double amount { get; set; }
        public string? description { get; set; }
        public DateTime transferred_on { get; set; }
    }
}
