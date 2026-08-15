using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Interfaces;
using Microsoft.Extensions.Configuration;
using Models;

namespace DL
{
    public class FeedbackDL : IFeedbackDL
    {
        private readonly ISupabaseRepository<Feedback> _feedbackRepo;
        private readonly ISupabaseRepository<User> _userRepo;
        private readonly List<string> _adminEmails;

        public FeedbackDL(
            ISupabaseRepository<Feedback> feedbackRepo,
            ISupabaseRepository<User> userRepo,
            IConfiguration configuration)
        {
            _feedbackRepo = feedbackRepo;
            _userRepo = userRepo;
            _adminEmails = configuration.GetSection("AdminEmails").Get<List<string>>() 
                ?? new List<string> { "vedant@gmail.com" };
        }

        public async Task CreateFeedbackInDB(Guid userId, FeedbackRequest request)
        {
            var feedback = new Feedback
            {
                id = Guid.NewGuid(),
                user_id = userId,
                feedback_type = request.feedback_type,
                subject = string.IsNullOrWhiteSpace(request.subject) ? null : request.subject.Trim(),
                message = request.message.Trim(),
                rating = request.rating,
                status = "NEW",
                admin_notes = null,
                created_at = DateTime.UtcNow,
                updated_at = DateTime.UtcNow
            };

            await _feedbackRepo.CreateAsync(feedback);
            Console.WriteLine($"[FeedbackDL Success]: Inserted feedback {feedback.id} ({feedback.feedback_type}) for user {userId}.");
        }

        public async Task<bool> IsUserAdminAsync(Guid userId)
        {
            try
            {
                var response = await _userRepo.GetClient()
                    .From<User>()
                    .Filter("id", Postgrest.Constants.Operator.Equals, userId.ToString())
                    .Get();

                var user = response.Models.FirstOrDefault();
                if (user != null && !string.IsNullOrEmpty(user.email))
                {
                    return _adminEmails.Any(e => e.Equals(user.email.Trim(), StringComparison.OrdinalIgnoreCase));
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FeedbackDL IsUserAdmin Error]: {ex.Message}");
                return false;
            }
        }

        public async Task<List<FeedbackAdminResponse>> GetAllFeedbackForAdminAsync()
        {
            var feedbacks = await _feedbackRepo.GetAllAsync() ?? new List<Feedback>();
            var users = await _userRepo.GetAllAsync() ?? new List<User>();
            var userMap = users.ToDictionary(u => u.id, u => u);

            var adminList = feedbacks.Select(f =>
            {
                userMap.TryGetValue(f.user_id, out var u);
                return new FeedbackAdminResponse
                {
                    id = f.id,
                    user_id = f.user_id,
                    user_name = !string.IsNullOrEmpty(u?.full_name) ? u.full_name : (!string.IsNullOrEmpty(u?.name) ? u.name : "User"),
                    user_email = u?.email ?? "Unknown Email",
                    feedback_type = f.feedback_type,
                    subject = f.subject,
                    message = f.message,
                    rating = f.rating,
                    status = f.status,
                    admin_notes = f.admin_notes,
                    created_at = f.created_at,
                    updated_at = f.updated_at
                };
            })
            .OrderByDescending(f => f.created_at)
            .ToList();

            return adminList;
        }

        public async Task UpdateFeedbackStatusInDB(Guid feedbackId, string status, string? adminNotes)
        {
            var idStr = feedbackId.ToString();
            var response = await _feedbackRepo.GetClient()
                .From<Feedback>()
                .Filter("id", Postgrest.Constants.Operator.Equals, idStr)
                .Get();

            var existing = response.Models.FirstOrDefault();
            if (existing == null)
            {
                throw new KeyNotFoundException("Feedback entry not found.");
            }

            existing.status = status;
            existing.admin_notes = string.IsNullOrWhiteSpace(adminNotes) ? null : adminNotes.Trim();
            existing.updated_at = DateTime.UtcNow;

            await _feedbackRepo.UpdateAsync(existing);
            Console.WriteLine($"[FeedbackDL Success]: Updated feedback {feedbackId} to status '{status}'.");
        }
    }
}
