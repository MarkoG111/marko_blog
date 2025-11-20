namespace API.Core
{
    public class JWTSettings
    {
        public string Issuer { get; set; }
        public string Audience { get; set; }
        public string SecretKey { get; set; }
        public int TokenExpiryMinutes { get; set; }
    }
}
