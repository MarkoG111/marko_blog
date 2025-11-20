using Application;

using Application.Commands.Post;
using Application.Commands.Category;
using Application.Commands.User;
using Application.Commands.Like;
using Application.Commands.Comment;
using Application.Commands.AuthorRequest;
using Application.Commands.Follow;
using Application.Commands.Notification;

using Application.Queries.UseCaseLogs;
using Application.Queries.Post;
using Application.Queries.Category;
using Application.Queries.User;
using Application.Queries.Comment;
using Application.Queries.AuthorRequest;
using Application.Queries.Follow;
using Application.Queries.Notification;

using Application.Repositories;
using Application.Services;

using Implementation.Validators.Post;
using Implementation.Validators.Category;
using Implementation.Validators.User;
using Implementation.Validators.Like;
using Implementation.Validators.Comment;
using Implementation.Validators.AuthorRequest;
using Implementation.Validators.Follow;

using Implementation.Commands.Post;
using Implementation.Commands.Category;
using Implementation.Commands.User;
using Implementation.Commands.Comment;
using Implementation.Commands.Like;
using Implementation.Commands.AuthorRequest;
using Implementation.Commands.Follow;
using Implementation.Commands.Notification;

using Implementation.Queries.UseCaseLogs;
using Implementation.Queries.Post;
using Implementation.Queries.Category;
using Implementation.Queries.Comment;
using Implementation.Queries.User;
using Implementation.Queries.AuthorRequest;
using Implementation.Queries.Follow;
using Implementation.Queries.Notification;

using Implementation.Repositories;
using Implementation.Services;

using Newtonsoft.Json;

namespace API.Core
{
    public static class APIExtension
    {
        public static void LoadUseCases(this IServiceCollection services)
        {
            services.AddTransient<UseCaseExecutor>();

            services.AddTransient<INotificationHubService, SignalRNotificationHub>();

            services.AddTransient<INotificationService, NotificationService>();

            services.AddTransient<ILikeRepository, LikeRepository>();
            services.AddTransient<ILikeService, LikeService>();
            services.AddTransient<IImageService, ImageService>();

            // Commands
            services.AddTransient<IRegisterUserCommand, EFRegisterUserCommand>();

            services.AddTransient<ICreatePostCommand, EFCreatePostCommand>();
            services.AddTransient<IUpdatePostCommand, EFUpdatePostCommand>();
            services.AddTransient<IDeletePostCommand, EFDeletePostCommand>();
            services.AddTransient<IUpdatePersonalPostCommand, EFUpdatePersonalPostCommand>();
            services.AddTransient<IDeletePersonalPostCommand, EFDeletePersonalPostCommand>();

            services.AddTransient<ICreateCategoryCommand, EFCreateCategoryCommand>();
            services.AddTransient<IUpdateCategoryCommand, EFUpdateCategoryCommand>();
            services.AddTransient<IDeleteCategoryCommand, EFDeleteCategoryCommand>();

            services.AddTransient<ICreateCommentCommand, EFCreateCommentCommand>();
            services.AddTransient<IUpdatePersonalCommentCommand, EFUpdatePersonalCommentCommand>();
            services.AddTransient<IDeleteCommentCommand, EFDeleteCommentCommand>();
            services.AddTransient<IDeletePersonalCommentCommand, EFDeletePersonalCommentCommand>();

            services.AddTransient<IUpdateUserCommand, EFUpdateUserCommand>();
            services.AddTransient<IDeleteUserCommand, EFDeleteUserCommand>();

            services.AddTransient<ILikePostCommand, EFLikePostCommand>();
            services.AddTransient<ILikeCommentCommand, EFLikeCommentCommand>();
            services.AddTransient<IUnlikeCommentCommand, EFUnlikeCommentCommand>();
            services.AddTransient<IUnlikePostCommand, EFUnlikePostCommand>();

            services.AddTransient<ICreateAuthorRequestCommand, EFCreateAuthorRequestCommand>();
            services.AddTransient<IUpdateAuthorRequestCommand, EFUpdateAuthorRequestCommand>();

            services.AddTransient<IFollowCommand, EFFollowCommand>();
            services.AddTransient<IUnfollowCommand, EFUnfollowCommand>();

            services.AddTransient<ICreateNotificationCommand, EFCreateNotificationCommand>();
            services.AddTransient<IMarkAllNotificationsAsReadCommand, EFMarkAllNotificationsAsReadCommand>();

            // Queries
            services.AddTransient<IGetPostsQuery, EFGetPostsQuery>();
            services.AddTransient<IGetPostQuery, EFGetOnePostQuery>();

            services.AddTransient<IGetCategoriesQuery, EFGetCategoriesQuery>();
            services.AddTransient<IGetCategoryQuery, EFGetOneCategoryQuery>();

            services.AddTransient<IGetCommentQuery, EFGetOneCommentQuery>();
            services.AddTransient<IGetCommentsQuery, EFGetCommentsQuery>();

            services.AddTransient<IGetUserQuery, EFGetOneUserQuery>();
            services.AddTransient<IGetUsersQuery, EFGetUsersQuery>();

            services.AddTransient<IGetAuthorRequestsQuery, EFGetAuthorRequestsQuery>();

            services.AddTransient<IGetUseCaseLogsQuery, EFGetUseCaseLogsQuery>();

            services.AddTransient<ICheckFollowStatusQuery, EFCheckFollowStatusQuery>();

            services.AddTransient<IGetNotificationsQuery, EFGetNotificationsQuery>();

            services.AddTransient<IGetFollowersQuery, EFGetFollowersQuery>();
            services.AddTransient<IGetFollowingQuery, EFGetFollowingsQuery>();

            // Validators
            services.AddTransient<RegisterUserValidator>();

            services.AddTransient<CreatePostValidator>();
            services.AddTransient<CreateCategoryValidator>();
            services.AddTransient<CreateCommentValidator>();

            services.AddTransient<LikePostValidator>();
            services.AddTransient<LikeCommentValidator>();

            services.AddTransient<UpdatePostValidator>();
            services.AddTransient<UpdateCategoryValidator>();
            services.AddTransient<UpdateCommentValidator>();
            services.AddTransient<UpdateUserValidator>();

            services.AddTransient<DeletePostValidator>();
            services.AddTransient<DeleteCategoryValidator>();
            services.AddTransient<DeleteCommentValidator>();

            services.AddTransient<AuthorRequestValidator>();

            services.AddTransient<FollowUserValidator>();
        }

        public static void AddApplicationActor(this IServiceCollection services)
        {
            services.AddTransient<IApplicationActor>(x =>
            {
                var accessor = x.GetService<IHttpContextAccessor>();

                var user = accessor.HttpContext.User;

                if (user.FindFirst("ActorData") == null)
                {
                    return new AnonymousActor();
                }

                var actorString = user.FindFirst("ActorData").Value;

                var actor = JsonConvert.DeserializeObject<JWTActor>(actorString);

                return actor;
            });
        }
    }
}