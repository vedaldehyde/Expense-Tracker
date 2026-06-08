using Interfaces;
using Models; 

namespace DL
{
    public class CategoriesDL : ICategoriesDL
    {
        private readonly ISupabaseRepository<Categories> _repository;

        public CategoriesDL(ISupabaseRepository<Categories> repository)
        {
            _repository = repository;
        }

        public async Task<List<ExpenseCategoriesResponse>>GetCategoriesFromDB()
        {
            var categories = await _repository.GetAllAsync();

            return categories.Select(x => new ExpenseCategoriesResponse
            {
                id = x.id,
                category_type = x.category_type
            }).ToList();
        }
    }    
}