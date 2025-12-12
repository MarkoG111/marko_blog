using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application;
using Application.Commands.Comment;
using Application.DataTransfer.Comments;
using Application.DataTransfer.Notifications;
using Application.Services;
using EFDataAccess;
using Domain;
using FluentValidation;
using Implementation.Validators.Comment;
using Microsoft.EntityFrameworkCore;

namespace Implementation.Commands.Comment
{
    public class EFCreateCommentCommand : ICreateCommentCommand
    {
        private readonly BlogContext _context;
        private readonly CreateCommentValidator _validator;
        private readonly IApplicationActor _actor;
        private readonly INotificationService _notificationService;

        public EFCreateCommentCommand(BlogContext context, CreateCommentValidator validator, IApplicationActor actor, INotificationService notificationService)
        {
            _context = context;
            _validator = validator;
            _actor = actor;
            _notificationService = notificationService;
        }

        public int Id => (int)UseCaseEnum.EFCreateCommentCommand;
        public string Name => UseCaseEnum.EFCreateCommentCommand.ToString();

        public async Task ExecuteAsync(UpsertCommentDto request)
        {
            _validator.ValidateAndThrow(request);

            request.IdUser = _actor.Id;

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var comment = new Domain.Comment
                {
                    CommentText = request.CommentText,
                    IdPost = request.IdPost,
                    IdParent = request.IdParent,
                    IdUser = request.IdUser,
                    CreatedAt = DateTime.UtcNow,
                };

                await _context.Comments.AddAsync(comment);
                await _context.SaveChangesAsync();

                request.Id = comment.Id;

                var post = await _context.Posts.Where(x => x.Id == request.IdPost).Select(x => new { x.IdUser, x.Title }).FirstOrDefaultAsync();
                if (post == null)
                {
                    await transaction.RollbackAsync();
                    return;
                }

                var notifications = new List<InsertNotificationDto>();

                // Notifikacija vlasniku posta
                if (post.IdUser != request.IdUser)
                {
                    notifications.Add(new InsertNotificationDto
                    {
                        IdUser = post.IdUser,
                        FromIdUser = request.IdUser,
                        Type = NotificationType.Comment,
                        Content = $"{_actor.Identity} has commented on your post.",
                        CreatedAt = DateTime.UtcNow,
                        IdComment = comment.Id
                    });
                }

                // Notifikacija vlasniku parent komentara
                if (request.IdParent.HasValue)
                {
                    var parentComment = await _context.Comments
                        .Where(c => c.Id == request.IdParent.Value)
                        .Select(c => new { c.IdUser, c.CommentText })
                        .FirstOrDefaultAsync();

                    if (parentComment != null && parentComment.IdUser != request.IdUser)
                    {
                        notifications.Add(new InsertNotificationDto
                        {
                            IdUser = parentComment.IdUser,
                            FromIdUser = request.IdUser,
                            Type = NotificationType.Comment,
                            Content = $"{_actor.Identity} has replied to your comment: \"{parentComment.CommentText}\"",
                            CreatedAt = DateTime.UtcNow,
                            IdComment = comment.Id
                        });
                    }
                }

                await transaction.CommitAsync();

                foreach (var notification in notifications)
                {
                    await _notificationService.CreateNotification(notification);
                }
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}