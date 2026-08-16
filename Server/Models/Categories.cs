using Postgrest.Attributes;
using Postgrest.Models;

namespace Models
{
    [Table("categories")]
    public class Categories : BaseModel
    {
        [PrimaryKey("id", true)]
        public Guid id { get; set; }

        [Column("category_type")]
        public string? category_type { get; set; }
    }

    public class CreateCategoryRequest
    {
        [System.Text.Json.Serialization.JsonPropertyName("CategoryType")]
        public string CategoryType { get; set; } = string.Empty;

        [System.Text.Json.Serialization.JsonPropertyName("categoryType")]
        public string? categoryType { set => CategoryType = value ?? string.Empty; }

        [System.Text.Json.Serialization.JsonPropertyName("category_type")]
        public string? category_type { set => CategoryType = value ?? string.Empty; }
    }
}