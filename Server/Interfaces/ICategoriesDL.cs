using Models;

namespace Interfaces
{
    public interface ICategoriesDL
    {
        Task<List<ExpenseCategoriesResponse>> GetCategoriesFromDB();
        Task<ExpenseCategoriesResponse> CreateCategoryInDB(string categoryType);
    }
}