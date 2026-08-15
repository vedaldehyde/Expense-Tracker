using Models;

namespace Interfaces
{
    public interface ICategoriesBL
    {
        Task<List<ExpenseCategoriesResponse>> GetCategoriesAsync();
        Task<ExpenseCategoriesResponse> CreateCategoryAsync(string categoryType);
    }   
}