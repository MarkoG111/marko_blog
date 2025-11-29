using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Commands.Follow;
using Application.DataTransfer.Followers;
using Application.DataTransfer.Notifications;
using Application.Services;
using EFDataAccess;
using Domain;
using Application;
using Implementation.Validators.Follow;
using FluentValidation;

namespace Implementation.Commands.Follow
{
    public class EFFollowCommand : IFollowCommand
    {
        private readonly BlogContext _context;
        private readonly IApplicationActor _actor;
        private readonly FollowUserValidator _validator;
        private readonly INotificationService _notificationService;

        public EFFollowCommand(BlogContext context, IApplicationActor actor, INotificationService notificationService, FollowUserValidator validator)
        {
            _context = context;
            _actor = actor;
            _validator = validator;
            _notificationService = notificationService;
        }

        public int Id => (int)UseCaseEnum.EFFollowCommand;
        public string Name => UseCaseEnum.EFFollowCommand.ToString();

        public async Task ExecuteAsync(InsertFollowDto request)
        {
            _validator.ValidateAndThrow(request);

            var follow = new Domain.Follower
            {
                IdFollower = request.IdUser,
                IdFollowing = request.IdFollowing,
                FollowedAt = DateTime.UtcNow
            };

            var notificationDto = new InsertNotificationDto
            {
                IdUser = request.IdFollowing,
                FromIdUser = _actor.Id,
                Type = NotificationType.Follow,
                Content = $"{_actor.Identity} started following you.",
                CreatedAt = DateTime.UtcNow
            };

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    _context.Followers.Add(follow);
                    await _context.SaveChangesAsync();

                    await _notificationService.CreateNotification(notificationDto);

                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
        }
    }
}