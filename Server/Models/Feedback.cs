using System;
using Postgrest.Attributes;
using Postgrest.Models;

namespace Models
{
    [Postgrest.Attributes.Table("feedback")]
    public class Feedback : BaseModel
    {
        [PrimaryKey("id", false)]
        public Guid id { get; set; }

        [Column("user_id")]
        public Guid user_id { get; set; }

        [Column("feedback_type")]
        public string feedback_type { get; set; } = string.Empty;

        [Column("subject")]
        public string? subject { get; set; }

        [Column("message")]
        public string message { get; set; } = string.Empty;

        [Column("rating")]
        public short? rating { get; set; }

        [Column("status")]
        public string status { get; set; } = "NEW";

        [Column("admin_notes")]
        public string? admin_notes { get; set; }

        [Column("created_at")]
        public DateTime created_at { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime updated_at { get; set; } = DateTime.UtcNow;
    }

    public class FeedbackRequest
    {
        public string feedback_type { get; set; } = string.Empty;
        public string? subject { get; set; }
        public string message { get; set; } = string.Empty;
        public short? rating { get; set; }
    }

    public class FeedbackAdminResponse
    {
        public Guid id { get; set; }
        public Guid user_id { get; set; }
        public string user_name { get; set; } = string.Empty;
        public string user_email { get; set; } = string.Empty;
        public string feedback_type { get; set; } = string.Empty;
        public string? subject { get; set; }
        public string message { get; set; } = string.Empty;
        public short? rating { get; set; }
        public string status { get; set; } = "NEW";
        public string? admin_notes { get; set; }
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
    }

    public class UpdateFeedbackStatusRequest
    {
        public Guid feedback_id { get; set; }
        public string status { get; set; } = string.Empty;
        public string? admin_notes { get; set; }
    }
}
