using Postgrest.Models;
using Supabase;
using Interfaces;
using System.Text.Json;

namespace Repositories
{
    public class SupabaseRepository<T> : ISupabaseRepository<T> where T : BaseModel, new()
    {
        private readonly Client _client;

        public SupabaseRepository(Client client)
        {
            _client = client;
        }

        public Client GetClient() => _client;

        public async Task<List<T>> GetAllAsync()
        {
            try
            {
                var response = await _client.From<T>().Get();
                return response.Models ?? new List<T>();
            }
            catch (Exception e)
            {
                Console.WriteLine($"[SupabaseRepository] GetAllAsync error: {e.Message}");
                return new List<T>();
            }
        }

        public async Task<List<T>> GetByUserIdAsync(Guid userId)
        {
            try
            {
                var typeName = typeof(T).Name;
                var response = await _client
                    .From<T>()
                    .Filter("user_id", Postgrest.Constants.Operator.Equals, userId.ToString())
                    .Get();

                var models = response.Models ?? new List<T>();
                Console.WriteLine($"[SupabaseRepository.GetByUserIdAsync] Table={typeName}, UserId={userId}, Returned={models.Count} rows.");
                return models;
            }
            catch (Exception e)
            {
                Console.WriteLine($"[SupabaseRepository.GetByUserIdAsync ERROR] Table={typeof(T).Name}, UserId={userId}, ExceptionType={e.GetType().Name}, Message={e.Message}");
                throw;
            }
        }

        public async Task<T?> GetByIdAsync(T id)
        {
            try
            {
                var idStr = id?.ToString() ?? string.Empty;
                var response = await _client
                    .From<T>()
                    .Filter("id", Postgrest.Constants.Operator.Equals, idStr)
                    .Get();

                return response.Models.FirstOrDefault();
            }
            catch (Exception e)
            {
                Console.WriteLine($"[SupabaseRepository] GetByIdAsync error: {e.Message}");
                return null;
            }
        }

        public async Task CreateAsync(T entity)
        {
            await _client
                .From<T>()
                .Insert(entity);
        }

        public async Task UpdateAsync(T entity)
        {
            await _client
                .From<T>()
                .Update(entity);
        }

        public async Task DeleteAsync(T entity)
        {
            await _client
                .From<T>()
                .Delete(entity);
        }

        public async Task<List<TResult>> ExecuteFunctionAsync<TResult>(string functionName, Dictionary<string, object>? parameters = null)
        {
            try
            {
                parameters ??= new Dictionary<string, object>();

                var response = await _client.Rpc(functionName, parameters);
                var json = response.Content;

                if (string.IsNullOrEmpty(json))
                {
                    return new List<TResult>();
                }
                return JsonSerializer.Deserialize<List<TResult>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<TResult>();

            }
            catch (System.Exception e)
            {
                System.Console.WriteLine($"[SupabaseRepository] ExecuteFunctionAsync error for '{functionName}': {e.Message}");
                throw;
            }
        }
    }
}