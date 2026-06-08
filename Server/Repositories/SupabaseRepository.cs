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

        public async Task<List<T>> GetAllAsync()
        {
            try
            {
                var response = await _client.From<T>().Get();
                return response.Models;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message.ToString());
                return null;
            }
            
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            var response = await _client
                .From<T>()
                .Filter("id", Postgrest.Constants.Operator.Equals, id)
                .Get();

            return response.Models.FirstOrDefault();
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

        public async Task<List<TResult>>ExecuteFunctionAsync<TResult>(string functionName, Dictionary<string, object>? parameters = null)
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
    }
}