using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application;
using Application.DataTransfer.Notifications;
using Application.Services;
using EFDataAccess;
using Domain;

namespace Implementation.Services
{
    public class NotificationService : INotificationService
    {
        private readonly BlogContext _context;
        private readonly INotificationHubService _notificationHubService;

        public NotificationService(BlogContext context, INotificationHubService notificationHubService)
        {
            _context = context;
            _notificationHubService = notificationHubService;
        }

        private string? GenerateNotificationLink(InsertNotificationDto dto)
        {
            return dto.Type switch
            {
                NotificationType.Post => $"/post/{dto.IdPost}",
                NotificationType.Comment => $"/comment/{dto.IdComment}",
                NotificationType.Like => $"/post/{dto.IdPost}",
                NotificationType.Follow => "/dashboard?tab=followers",
                _ => "/notifications",
            };
        }

        public async Task CreateNotification(InsertNotificationDto dto)
        {
            dto.Link = GenerateNotificationLink(dto);

            var notification = new Notification
            {
                IdUser = dto.IdUser,
                FromIdUser = dto.FromIdUser,
                Type = dto.Type,
                Content = dto.Content,
                Link = dto.Link,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();

            await _notificationHubService.SendNotificationToUser(dto.IdUser, new
            {
                id = notification.Id,
                type = notification.Type,
                content = notification.Content,
                link = notification.Link,
                isRead = notification.IsRead,
                createdAt = notification.CreatedAt
            });
        }

    }
}