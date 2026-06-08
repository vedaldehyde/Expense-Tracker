using Postgrest.Attributes;
using Postgrest.Models;

namespace Models
{
    [Table("categories")]
    public class Categories : BaseModel
    {
        [PrimaryKey("id", false)]
        public Guid id { get; set; }

        [Column("created_at")]
        public DateTime? created_at { get; set; }

        [Column("category_type")]
        public string? category_type { get; set; }
    }
}