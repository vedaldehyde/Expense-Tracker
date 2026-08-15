using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Models;
using Interfaces;
using Server.Utils;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Postgrest.Attributes;
using Postgrest.Models;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ISupabaseRepository<User> _userRepository;
        private readonly IConfiguration _configuration;

        public AuthController(ISupabaseRepository<User> userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var emailVal = request.Email;
            var passwordVal = request.Password;
            var nameVal = request.Name;

            if (string.IsNullOrWhiteSpace(emailVal) || string.IsNullOrWhiteSpace(passwordVal) || string.IsNullOrWhiteSpace(nameVal))
            {
                return BadRequest(new { message = "All fields are required." });
            }

            var client = _userRepository.GetClient();
            var cleanEmail = emailVal.Trim().ToLower();

            try
            {
                var existing = await client.From<UserDbRecord>().Filter("email", Postgrest.Constants.Operator.Equals, cleanEmail).Get();
                if (existing.Models != null && existing.Models.Any())
                {
                    return BadRequest(new { message = "User with this email already exists." });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Check User Exception]: {ex.Message}");
            }

            var userId = Guid.NewGuid();

            try
            {
                var userRecord = new UserDbRecord
                {
                    id = userId,
                    email = cleanEmail,
                    password_hash = PasswordHasher.HashPassword(passwordVal),
                    full_name = nameVal.Trim(),
                    created_at = DateTime.UtcNow
                };
                await client.From<UserDbRecord>().Insert(userRecord);
                Console.WriteLine($"[Register Success]: Inserted user {userId} ({cleanEmail}) into public.users table.");
                return Ok(new { message = "User registered successfully. Please sign in." });
            }
            catch (Exception dbEx)
            {
                Console.WriteLine($"[Register Error]: {dbEx.Message}");
                return StatusCode(500, new { message = $"Failed to register user in database: {dbEx.Message}" });
            }
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var emailVal = request.Email;
            var passwordVal = request.Password;

            if (string.IsNullOrWhiteSpace(emailVal) || string.IsNullOrWhiteSpace(passwordVal))
            {
                return BadRequest(new { message = "Email and password are required." });
            }

            var client = _userRepository.GetClient();
            var cleanEmail = emailVal.Trim().ToLower();

            try
            {
                var result = await client.From<UserDbRecord>().Filter("email", Postgrest.Constants.Operator.Equals, cleanEmail).Get();
                var user = result.Models != null ? result.Models.FirstOrDefault() : null;

                if (user == null || !PasswordHasher.VerifyPassword(passwordVal, user.password_hash))
                {
                    return BadRequest(new { message = "Incorrect email or password." });
                }

                var userObj = new User { id = user.id, email = user.email, name = string.IsNullOrEmpty(user.full_name) ? user.email : user.full_name };
                var token = GenerateJwtToken(userObj);
                return Ok(new { token, user = new { id = user.id, email = user.email, name = userObj.name } });
            }
            catch (Exception dbEx)
            {
                Console.WriteLine($"[Login UserDbRecord Error]: {dbEx.Message}");
                return StatusCode(500, new { message = "Sign in failed. Please check database connection." });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Secret"] ?? "SpendWiseSuperSecretJWTSigningKeyKey123!!!");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
                    new Claim(ClaimTypes.Name, string.IsNullOrEmpty(user.name) ? user.email : user.name),
                    new Claim(ClaimTypes.Email, user.email)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = jwtSettings["Issuer"] ?? "SpendWiseServer",
                Audience = jwtSettings["Audience"] ?? "SpendWiseClient",
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    [Postgrest.Attributes.Table("users")]
    public class UserDbRecord : BaseModel
    {
        [Postgrest.Attributes.PrimaryKey("id", false)]
        public Guid id { get; set; }

        [Postgrest.Attributes.Column("email")]
        public string email { get; set; } = string.Empty;

        [Postgrest.Attributes.Column("password_hash")]
        public string password_hash { get; set; } = string.Empty;

        [Postgrest.Attributes.Column("full_name")]
        public string full_name { get; set; } = string.Empty;

        [Postgrest.Attributes.Column("created_at")]
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
