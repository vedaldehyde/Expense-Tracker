using Interfaces;
using Models;

namespace BL
{
    public class CategoriesBL : ICategoriesBL
    {
        private readonly ICategoriesDL _categoriesDL;

        public CategoriesBL(ICategoriesDL categoriesDL)
        {
            _categoriesDL = categoriesDL;
        }

        public async Task<List<ExpenseCategoriesResponse>> GetCategoriesAsync()
        {
            return await _categoriesDL.GetCategoriesFromDB();
        }

        public async Task<ExpenseCategoriesResponse> CreateCategoryAsync(string categoryType)
        {
            return await _categoriesDL.CreateCategoryInDB(categoryType);
        }
    }
}