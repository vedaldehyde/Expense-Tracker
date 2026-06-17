namespace Interfaces
{
    public interface ISupabaseRepository<T>
    {
        Task<List<T>> GetAllAsync();
        Task CreateAsync(T entity);
        Task<T> GetByIdAsync(T id);
        Task UpdateAsync(T entity);
        Task<List<TResult>> ExecuteFunctionAsync<TResult>(string functionName, Dictionary<string, object>? parameters = null);
    }
}