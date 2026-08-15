using Supabase;

namespace Interfaces
{
    public interface ISupabaseRepository<T>
    {
        Task<List<T>> GetAllAsync();
        Task<List<T>> GetByUserIdAsync(Guid userId);
        Task CreateAsync(T entity);
        Task<T?> GetByIdAsync(T id);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
        Task<List<TResult>> ExecuteFunctionAsync<TResult>(string functionName, Dictionary<string, object>? parameters = null);
        Client GetClient();
    }
}