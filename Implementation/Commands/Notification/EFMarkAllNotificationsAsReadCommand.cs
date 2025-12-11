using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application;
using Application.Commands.Notification;
using Application.DataTransfer;
using EFDataAccess;
using EFCore.BulkExtensions;

namespace Implementation.Commands.Notification
{
    public class EFMarkAllNotificationsAsReadCommand : IMarkAllNotificationsAsReadCommand
    {
        private readonly BlogContext _context;

        public EFMarkAllNotificationsAsReadCommand(BlogContext context)
        {
            _context = context;
        }

        public int Id => (int)UseCaseEnum.EFMarkAllNotificationsAsReadCommand;
        public string Name => UseCaseEnum.EFMarkAllNotificationsAsReadCommand.ToString();

        public void Execute(int IdUser)
        {
            var notifications = _context.Notifications.Where(n => n.IdUser == IdUser && !n.IsRead).ToList();

            if (notifications.Count == 0)
            {
                return;
            }

            notifications.ForEach(n => n.IsRead = true);

            _context.BulkUpdate(notifications);
        }
    }
}