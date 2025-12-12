using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.Core
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            Console.WriteLine("UserIdentifier: " + Context.UserIdentifier);
            var idUser = Context.User?.FindFirst("IdUser")?.Value;
            Console.WriteLine($"User {idUser} connected with connection ID {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }
    }
}