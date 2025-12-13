using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application;
using Application.Commands.Post;
using Application.DataTransfer.Notifications;
using Application.DataTransfer.Posts;
using Application.Services;
using Domain;
using EFDataAccess;
using FluentValidation;
using Implementation.Validators.Post;
using Microsoft.EntityFrameworkCore;

namespace Implementation.Commands.Post
{
    public class EFCreatePostCommand : ICreatePostCommand
    {
        private readonly BlogContext _context;
        private readonly IApplicationActor _actor;
        private readonly CreatePostValidator _validator;
        private readonly INotificationService _notificationService;

        public EFCreatePostCommand(CreatePostValidator validator, IApplicationActor actor, BlogContext context, INotificationService notificationService)
        {
            _validator = validator;
            _actor = actor;
            _context = context;
            _notificationService = notificationService;
        }

        public int Id => (int)UseCaseEnum.EFCreatePostCommand;
        public string Name => UseCaseEnum.EFCreatePostCommand.ToString();

        public async Task ExecuteAsync(UpsertPostDto request)
        {
            _validator.ValidateAndThrow(request);

            var post = new Domain.Post
            {
                Title = request.Title,
                Content = request.Content,
                IdImage = request.IdImage,
                CreatedAt = DateTime.UtcNow,
                IdUser = _actor.Id,
                PostCategories = request.CategoryIds.Select(categoryId => new PostCategory
                {
                    IdCategory = categoryId,
                }).ToList()
            };

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    await _context.Posts.AddAsync(post);
                    await _context.SaveChangesAsync();

                    request.Id = post.Id;

                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

            var followers = await _context.Followers.Where(f => f.IdFollowing == post.IdUser).Select(f => f.IdFollower).ToListAsync();

            foreach (var idFollower in followers)
            {
                var notificationDto = new InsertNotificationDto
                {
                    IdUser = idFollower,
                    FromIdUser = post.IdUser,
                    Type = NotificationType.Post,
                    Content = $"{_actor.Identity} has published a new post: {post.Title}",
                    CreatedAt = DateTime.UtcNow,
                    IdPost = post.Id
                };

                await _notificationService.CreateNotification(notificationDto);
            }

        }
    }
}