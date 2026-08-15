using Postgrest.Attributes;
using Postgrest.Models;
using System;
using System.Collections.Generic;

namespace Models
{
    [Postgrest.Attributes.Table("income")]
    public class Income : BaseModel
    {
        [PrimaryKey("id", false)]
        public Guid id { get; set; }

        [Column("user_id")]
        public Guid? user_id { get; set; }

        [Column("source")]
        public string? source { get; set; }

        [Column("balance")]
        public double? balance { get; set; }

        [Column("is_salary")]
        public bool is_salary { get; set; }

        [Column("updated_at")]
        public DateTime? updated_at { get; set; }
    }

    public class IncomeRequest
    {
        public Guid id { get; set; }
        public string? source { get; set; }
        public double? balance { get; set; }
        public bool isSalary { get; set; }
    }

    public class Incomes
    {
        public Guid id { get; set; }
        public string? source { get; set; }
        public double? balance { get; set; }
        public bool isSalary { get; set; }
    }

    public class IncomeResponse
    {
        public List<Incomes>? incomesList { get; set; }
        public double total_balance { get; set; }
    }
}