using System;

namespace Implementation
{
    public enum RoleEnum
    {
        Admin = 1,
        User = 2,
        Author = 3
    }

    public enum UseCaseEnum
    {
        EFRegisterUserCommand = 1,

        EFCreatePostCommand = 2,
        EFUpdatePostCommand = 3,
        EFDeletePostCommand = 4,
        EFGetOnePostQuery = 5,
        EFGetPostsQuery = 6,
        EFUpdatePersonalPostCommand = 7,
        EFDeletePersonalPostCommand = 8,

        EFCreateCommentCommand = 9,
        EFUpdateCommentCommand = 10,
        EFDeleteCommentCommand = 11,
        EFGetOneCommentQuery = 12,
        EFGetCommentsQuery = 13,
        EFUpdatePersonalCommentCommand = 14,
        EFDeletePersonalCommentCommand = 15,

        EFLikePostCommand = 16,
        EFLikeCommentCommand = 17,
        EFUnlikeCommentCommand = 18,
        EFUnlikePostCommand = 19,

        EFGetUseCaseLogQuery = 20,

        EFUpdateUserCommand = 21,
        EFDeleteUserCommand = 22,
        EFGetOneUserQuery = 23,
        EFGetUsersQuery = 24,

        EFCreateCategoryCommand = 25,
        EFUpdateCategoryCommand = 26,
        EFDeleteCategoryCommand = 27,
        EFGetOneCategoryQuery = 28,
        EFGetCategoriesQuery = 29,

        EFCreateAuthorRequestCommand = 30,
        EFUpdateAuthorRequestCommand = 31,
        EFGetAuthorRequestsQuery = 32,

        EFFollowCommand = 33,
        EFUnfollowCommand = 34,
        EFCheckFollowStatusQuery = 35,

        EFGetFollowersQuery = 36,
        EFGetFollowingsQuery = 37,

        EFCreateNotificationCommand = 38,
        EFGetNotificationsQuery = 39,
        EFMarkAllNotificationsAsReadCommand = 40,
    }
}