using API.Core;
using EFDataAccess;
using Application;
using Application.Settings;
using Application.Commands.Email;
using Implementation.Logging;
using Implementation.Commands.Email;
using Microsoft.OpenApi.Models;
using API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace API
{
    public class Startup
    {
        public IConfiguration _configuration { get; }

        public Startup(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();

            services.AddDbContext<BlogContext>(options =>
                options.UseSqlServer(
                    _configuration.GetConnectionString("DefaultConnection"),
                    sql => sql.EnableRetryOnFailure()
                )
            );

            services.Configure<JWTSettings>(_configuration.GetSection("JWT"));
            services.Configure<SMTPSettings>(_configuration.GetSection("SMTP"));

            services.AddSingleton(res => res.GetRequiredService<IOptions<JWTSettings>>().Value);
            services.AddSingleton(res => res.GetRequiredService<IOptions<SMTPSettings>>().Value);

            services.AddScoped<JWTService>();
            services.AddScoped<JWTManager>();

            services.AddScoped<OAuthService>();

            services.LoadUseCases();

            services.AddScoped<IUseCaseLogger, EFDatabaseLogger>();

            services.AddHttpContextAccessor();
            services.AddApplicationActor();

            var jwtSettings = _configuration.GetSection("JWT").Get<JWTSettings>();
            var key = Encoding.UTF8.GetBytes(jwtSettings.SecretKey);

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = false;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = jwtSettings.Issuer,
                    ValidateIssuer = true,
                    ValidAudience = jwtSettings.Audience,
                    ValidateAudience = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

            services.AddSignalR();

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "BlogAPI", Version = "v1" });
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = @"JWT Authorization header using the Bearer scheme. \r\n\r\n 
                      Enter 'Bearer' [space] and then your token in the text input below.
                      \r\n\r\nExample: 'Bearer 12345abcdef'",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement()
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            },
                            Scheme = "oauth2",
                            Name = "Bearer",
                            In = ParameterLocation.Header
                        },
                        new List<string>()
                    }
                });
            });

            services.AddTransient<IEmailSender, SMTPEmailSender>();

            services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigin", builder =>
                {
                    builder.WithOrigins("http://localhost:5173", "https://marko-blog.vercel.app")
                           .AllowAnyMethod()
                           .AllowAnyHeader()
                           .AllowCredentials();
                });
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // Checks if the application is running in a development environment. If it is, adds the DeveloperExceptionPage middleware, which displays detailed information about exceptions during application development.
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseDefaultFiles();
            // Adds middleware that allows the server to serve static files, such as HTML, CSS, JavaScript, and images.
            app.UseStaticFiles();

            // Adds middleware for routing, which enables the application to determine which code to execute based on the incoming HTTP request.
            app.UseRouting();

            // Adds middleware for handling Cross-Origin Resource Sharing (CORS) requests. This middleware allows defining CORS policies that determine which origin domains are allowed to access resources on the server.
            app.UseCors("AllowSpecificOrigin");

            // Adds middleware for authentication, which allows the application to authenticate users based on incoming credentials or tokens.
            app.UseAuthentication();

            // Adds middleware for Swagger support, which generates API documentation based on route and controller definitions in the application.
            app.UseSwagger();
            // Adds middleware that generates an HTML interface for the Swagger documentation, allowing the API specifications to be viewed in a web browser.
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "BlogAPI v1");
            });

            // Adds the GlobalExceptionHandler middleware component, which handles all exceptions that have not been processed yet and provides an appropriate response to the user or application.
            app.UseMiddleware<GlobalExceptionHandler>();

            app.UseSentryTracing();

            // Adds middleware for defining endpoints in the application, i.e., mapping HTTP requests to corresponding actions in controllers.
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<NotificationHub>("/api/notificationsHub");

                endpoints.MapGet("/health", async context =>
                {
                    await context.Response.WriteAsync("OK");
                });
            });
        }
    }
}