using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Domain;
using API.Core;
using Microsoft.Extensions.Options;

namespace API.Services
{
    public class JWTService
    {
        private readonly JWTSettings _settings;

        public JWTService(IOptions<JWTSettings> options)
        {
            _settings = options.Value;
        }

        public List<Claim> GenerateClaims(User user)
        {
            var actor = new JWTActor
            {
                Id = user.Id,
                AllowedUseCases = user.UserUseCases.Select(x => x.IdUseCase),
                Identity = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                RoleName = user.Role.Name,
                ProfilePicture = user.ProfilePicture
            };

            return new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString(), ClaimValueTypes.String, _settings.Issuer),
                new Claim(JwtRegisteredClaimNames.Iss, _settings.Issuer, ClaimValueTypes.String, _settings.Issuer),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64, _settings.Issuer),
                new Claim("IdUser", actor.Id.ToString()),
                new Claim("ActorData", JsonConvert.SerializeObject(actor))
            };
        }

        public string GenerateToken(IEnumerable<Claim> claims)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.SecretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _settings.Issuer,
                audience: _settings.Audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddMinutes(_settings.TokenExpiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}