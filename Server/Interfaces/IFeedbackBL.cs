using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Models;

namespace Interfaces
{
    public interface IFeedbackBL
    {
        Task CreateFeedbackAsync(Guid userId, FeedbackRequest request);
        Task<List<FeedbackAdminResponse>> GetAllFeedbackForAdminAsync(Guid userId);
        Task UpdateFeedbackStatusAsync(Guid userId, UpdateFeedbackStatusRequest request);
        Task<bool> IsUserAdminAsync(Guid userId);
    }
}
