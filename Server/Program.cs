using BL;
using DL;
using Interfaces;
using Repositories;
using Supabase;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddScoped(typeof(ISupabaseRepository<>), typeof(SupabaseRepository<>));
builder.Services.AddScoped<ICategoriesDL, CategoriesDL>();
builder.Services.AddScoped<ICategoriesBL, CategoriesBL>();
// Register repositories for Expense and Categories so they can be injected into DL classes
builder.Services.AddScoped(typeof(ISupabaseRepository<Models.Expense>), typeof(Repositories.SupabaseRepository<Models.Expense>));
builder.Services.AddScoped(typeof(ISupabaseRepository<Models.Categories>), typeof(Repositories.SupabaseRepository<Models.Categories>));
builder.Services.AddScoped<IExpenseBL, ExpenseBL>();
builder.Services.AddScoped<IExpenseDL, ExpenseDL>();
builder.Services.AddScoped<IBudgetBL, BudgetBL>();
builder.Services.AddScoped<IBudgetDL, BudgetDL>();
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
var allowedOrigins = builder.Configuration.GetValue<string>("AllowedOrigins")?.Split(';', StringSplitOptions.RemoveEmptyEntries)
    ?? new[] { "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
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

app.UseHttpsRedirection();

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

app.MapControllers();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
