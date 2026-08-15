using Postgrest.Attributes;
using Postgrest.Models;

namespace Models
{
    [Table("categories")]
    public class Categories : BaseModel
    {
        [PrimaryKey("id", false)]
        public Guid id { get; set; }

        [Column("category_type")]
        public string? category_type { get; set; }
    }

    public class CreateCategoryRequest
    {
        public string CategoryType { get; set; } = string.Empty;
    }
}