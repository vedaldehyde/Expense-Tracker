using BL;
using DL;
using Interfaces;
using Repositories;
using Supabase;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"] ?? "SpendWiseSuperSecretJWTSigningKeyKey123!!!";
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "SpendWiseServer",
        ValidAudience = jwtSettings["Audience"] ?? "SpendWiseClient",
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddScoped(typeof(ISupabaseRepository<>), typeof(SupabaseRepository<>));


// Register repositories for Expense, Categories, Budget, and SavingsHistory so they can be injected into DL classes
builder.Services.AddScoped(typeof(ISupabaseRepository<Models.Expense>), typeof(Repositories.SupabaseRepository<Models.Expense>));
builder.Services.AddScoped(typeof(ISupabaseRepository<Models.Categories>), typeof(Repositories.SupabaseRepository<Models.Categories>));
builder.Services.AddScoped(typeof(ISupabaseRepository<Models.Budget>), typeof(Repositories.SupabaseRepository<Models.Budget>));
builder.Services.AddScoped(typeof(ISupabaseRepository<Models.SavingsHistory>), typeof(Repositories.SupabaseRepository<Models.SavingsHistory>));
builder.Services.AddScoped(typeof(ISupabaseRepository<Models.AccountTransfer>), typeof(Repositories.SupabaseRepository<Models.AccountTransfer>));
builder.Services.AddScoped(typeof(ISupabaseRepository<Models.Feedback>), typeof(Repositories.SupabaseRepository<Models.Feedback>));

builder.Services.AddScoped<ISavingsHistoryBL, SavingsHistoryBL>();
builder.Services.AddScoped<ISavingsHistoryDL, SavingsHistoryDL>();
builder.Services.AddScoped<ICategoriesDL, CategoriesDL>();
builder.Services.AddScoped<ICategoriesBL, CategoriesBL>();
builder.Services.AddScoped<IExpenseBL, ExpenseBL>();
builder.Services.AddScoped<IExpenseDL, ExpenseDL>();
builder.Services.AddScoped<IBudgetBL, BudgetBL>();
builder.Services.AddScoped<IBudgetDL, BudgetDL>();
builder.Services.AddScoped<IIncomeBL, IncomeBL>();
builder.Services.AddScoped<IIncomeDL, IncomeDL>();
builder.Services.AddScoped<IFixedExpenseBL, FixedExpenseBL>();
builder.Services.AddScoped<IFixedExpenseDL, FixedExpenseDL>();
builder.Services.AddScoped<IAccountTransferBL, AccountTransferBL>();
builder.Services.AddScoped<IAccountTransferDL, AccountTransferDL>();
builder.Services.AddScoped<IFeedbackBL, FeedbackBL>();
builder.Services.AddScoped<IFeedbackDL, FeedbackDL>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<IAIService, AIService>();
builder.Services.AddScoped<CategoriesBL>();


var supabaseUrl = builder.Configuration.GetValue<string>("SupabaseUrl")
    ?? throw new InvalidOperationException("SupabaseUrl is not configured. Set it in appsettings or environment variables.");
var supabaseKey = builder.Configuration.GetValue<string>("SupabaseKey")
    ?? throw new InvalidOperationException("SupabaseKey is not configured. Set it in appsettings or environment variables.");

builder.Services.AddScoped<Supabase.Client>(_ => new Supabase.Client(
    supabaseUrl,
    supabaseKey,
    new SupabaseOptions
    {
        AutoRefreshToken = true,
        AutoConnectRealtime = true
    }
));

// Register CORS so frontend can access the API. Configure origins via appsettings or environment variable "AllowedOrigins" (semicolon-separated), default to http://localhost:3000.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS policy
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
