namespace Interfaces
{
    public interface ICategoriesBL
    {
        Task<List<ExpenseCategoriesResponse>> GetCategoriesAsync();
    }   
}