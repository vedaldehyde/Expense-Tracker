using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Models;

namespace Interfaces
{
    public interface IFeedbackDL
    {
        Task CreateFeedbackInDB(Guid userId, FeedbackRequest request);
        Task<List<FeedbackAdminResponse>> GetAllFeedbackForAdminAsync();
        Task UpdateFeedbackStatusInDB(Guid feedbackId, string status, string? adminNotes);
        Task<bool> IsUserAdminAsync(Guid userId);
    }
}
