using System;
using Postgrest.Attributes;
using Postgrest.Models;
using Newtonsoft.Json;

namespace Models
{
    [Postgrest.Attributes.Table("users")]
    public class User : Postgrest.Models.BaseModel
    {
        [Postgrest.Attributes.PrimaryKey("id", false)]
        public Guid id { get; set; }

        [Postgrest.Attributes.Column("email")]
        public string email { get; set; } = string.Empty;

        [Postgrest.Attributes.Column("password_hash")]
        public string password_hash { get; set; } = string.Empty;

        [Newtonsoft.Json.JsonIgnore]
        public string password { get => password_hash; set => password_hash = value; }

        [Postgrest.Attributes.Column("full_name")]
        public string full_name { get; set; } = string.Empty;

        [Newtonsoft.Json.JsonIgnore]
        public string name { get => full_name; set => full_name = value; }

        [Postgrest.Attributes.Column("created_at")]
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
