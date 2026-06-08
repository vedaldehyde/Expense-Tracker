namespace Interfaces
{
    public interface ICategoriesDL
    {
        Task<List<ExpenseCategoriesResponse>> GetCategoriesFromDB();
    }
}