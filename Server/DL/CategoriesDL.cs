using Interfaces;
using Models; 
using System;
using System.Linq;

namespace DL
{
    public class CategoriesDL : ICategoriesDL
    {
        private readonly ISupabaseRepository<Categories> _repository;

        public CategoriesDL(ISupabaseRepository<Categories> repository)
        {
            _repository = repository;
        }

        public async Task<List<ExpenseCategoriesResponse>> GetCategoriesFromDB()
        {
            try
            {
                var categories = await _repository.GetAllAsync();
                return categories.Select(x => new ExpenseCategoriesResponse
                {
                    id = x.id,
                    category_type = x.category_type
                }).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CategoriesDL GetAll Error]: {ex.Message}");
                return new List<ExpenseCategoriesResponse>();
            }
        }

        public async Task<ExpenseCategoriesResponse> CreateCategoryInDB(string categoryType)
        {
            var trimmedName = categoryType.Trim();
            var client = _repository.GetClient();

            // 1. Check if category already exists in DB (case-insensitive)
            try
            {
                var existingCategoriesRes = await client.From<Categories>().Get();
                var existingCategories = existingCategoriesRes.Models ?? new List<Categories>();
                var match = existingCategories.FirstOrDefault(c => c.category_type != null && c.category_type.Equals(trimmedName, StringComparison.OrdinalIgnoreCase));
                
                if (match != null)
                {
                    Console.WriteLine($"[CreateCategory Found Existing]: Category {match.id} ({match.category_type}) already exists.");
                    return new ExpenseCategoriesResponse { id = match.id, category_type = match.category_type };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CreateCategory Search Error]: {ex.Message}");
            }

            // 2. Insert new category in categories table
            var newCategory = new Categories
            {
                id = Guid.NewGuid(),
                category_type = trimmedName
            };

            try
            {
                var insertRes = await client.From<Categories>().Insert(newCategory);
                var createdObj = insertRes.Models?.FirstOrDefault() ?? newCategory;
                Console.WriteLine($"[CreateCategory Success]: Inserted category {createdObj.id} ({trimmedName}) into categories table.");
                return new ExpenseCategoriesResponse { id = createdObj.id, category_type = createdObj.category_type };
            }
            catch (Exception insertEx)
            {
                Console.WriteLine($"[CreateCategory Insert Error]: {insertEx.Message}");
                throw;
            }
        }
    }
}