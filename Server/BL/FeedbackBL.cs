using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Interfaces;
using Models;

namespace BL
{
    public class FeedbackBL : IFeedbackBL
    {
        private readonly IFeedbackDL _feedbackDL;
        private static readonly HashSet<string> ValidTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "BUG",
            "FEATURE_REQUEST",
            "IMPROVEMENT",
            "OTHER"
        };

        private static readonly HashSet<string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "NEW",
            "REVIEWED",
            "PLANNED",
            "IN_PROGRESS",
            "DONE",
            "REJECTED"
        };

        public FeedbackBL(IFeedbackDL feedbackDL)
        {
            _feedbackDL = feedbackDL;
        }

        public async Task CreateFeedbackAsync(Guid userId, FeedbackRequest request)
        {
            if (request == null)
            {
                throw new ArgumentException("Feedback request payload cannot be empty.");
            }

            string feedbackType = request.feedback_type?.Trim().ToUpperInvariant() ?? string.Empty;
            if (string.IsNullOrEmpty(feedbackType) || !ValidTypes.Contains(feedbackType))
            {
                throw new ArgumentException("Invalid feedback type. Valid options are: BUG, FEATURE_REQUEST, IMPROVEMENT, OTHER.");
            }

            string trimmedMessage = request.message?.Trim() ?? string.Empty;
            if (string.IsNullOrEmpty(trimmedMessage))
            {
                throw new ArgumentException("Feedback message is required and cannot be empty.");
            }

            if (trimmedMessage.Length > 2000)
            {
                throw new ArgumentException("Feedback message cannot exceed 2000 characters.");
            }

            string? trimmedSubject = request.subject?.Trim();
            if (!string.IsNullOrEmpty(trimmedSubject) && trimmedSubject.Length > 150)
            {
                throw new ArgumentException("Feedback subject cannot exceed 150 characters.");
            }

            if (request.rating.HasValue && (request.rating.Value < 1 || request.rating.Value > 5))
            {
                throw new ArgumentException("Rating must be between 1 and 5.");
            }

            request.feedback_type = feedbackType;
            request.message = trimmedMessage;
            request.subject = string.IsNullOrEmpty(trimmedSubject) ? null : trimmedSubject;

            await _feedbackDL.CreateFeedbackInDB(userId, request);
        }

        public async Task<bool> IsUserAdminAsync(Guid userId)
        {
            return await _feedbackDL.IsUserAdminAsync(userId);
        }

        public async Task<List<FeedbackAdminResponse>> GetAllFeedbackForAdminAsync(Guid userId)
        {
            bool isAdmin = await _feedbackDL.IsUserAdminAsync(userId);
            if (!isAdmin)
            {
                throw new UnauthorizedAccessException("Access denied. Admin privileges required.");
            }

            return await _feedbackDL.GetAllFeedbackForAdminAsync();
        }

        public async Task UpdateFeedbackStatusAsync(Guid userId, UpdateFeedbackStatusRequest request)
        {
            bool isAdmin = await _feedbackDL.IsUserAdminAsync(userId);
            if (!isAdmin)
            {
                throw new UnauthorizedAccessException("Access denied. Admin privileges required.");
            }

            if (request == null || request.feedback_id == Guid.Empty)
            {
                throw new ArgumentException("Valid feedback ID is required.");
            }

            string status = request.status?.Trim().ToUpperInvariant() ?? string.Empty;
            if (string.IsNullOrEmpty(status) || !ValidStatuses.Contains(status))
            {
                throw new ArgumentException("Invalid status. Valid options are: NEW, REVIEWED, PLANNED, IN_PROGRESS, DONE, REJECTED.");
            }

            await _feedbackDL.UpdateFeedbackStatusInDB(request.feedback_id, status, request.admin_notes);
        }
    }
}
