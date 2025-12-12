using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace API.Core
{
    public class SignalRUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            return connection.User?.FindFirst("IdUser")?.Value
                     ?? connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? connection.User?.FindFirst("sub")?.Value;
        }
    }
}
