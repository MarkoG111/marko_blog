using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application;
using Application.Exceptions;
using Application.Commands.Like;
using Application.DataTransfer.Likes;
using Application.DataTransfer.Notifications;
using Application.Services;
using EFDataAccess;
using FluentValidation;
using Implementation.Validators.Like;
using Implementation.Services;
using Domain;

namespace Implementation.Commands.Like
{
    public class EFLikePostCommand : ILikePostCommand
    {
        private readonly BlogContext _context;
        private readonly LikePostValidator _validator;
        private readonly IApplicationActor _actor;
        private readonly ILikeService _likeService;
        private readonly INotificationService _notificationService;

        public EFLikePostCommand(ILikeService likeService, LikePostValidator validator, BlogContext context, IApplicationActor actor, INotificationService notificationService)
        {
            _validator = validator;
            _context = context;
            _actor = actor;
            _likeService = likeService;
            _notificationService = notificationService;
        }

        public int Id => (int)UseCaseEnum.EFLikePostCommand;
        public string Name => UseCaseEnum.EFLikePostCommand.ToString();

        public async Task ExecuteAsync(LikeDto request)
        {
            _validator.ValidateAndThrow(request);

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var like = await _likeService.ToggleLike(request);

                    if (like != null)
                    {
                        var post = await _context.Posts.FindAsync(request.IdPost);

                        if (post == null)
                        {
                            throw new EntityNotFoundException(request.IdPost, typeof(Domain.Post));
                        }

                        await _notificationService.CreateNotification(new InsertNotificationDto
                        {
                            IdUser = post.IdUser,
                            FromIdUser = _actor.Id,
                            Type = NotificationType.Like,
                            Content = $"{_actor.Identity} liked your post.",
                            IdPost = request.IdPost,
                            CreatedAt = DateTime.UtcNow
                        });
                    }

                    await transaction.CommitAsync();
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }


    }
}