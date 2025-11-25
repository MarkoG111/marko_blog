using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.DataTransfer.Posts;
using Application.DataTransfer.UseCases;
using Application.DataTransfer.Likes;
using Application.DataTransfer.Comments;

namespace Application.DataTransfer.Users
{
    public class GetUserDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string ProfilePicture { get; set; }
        public int IdRole { get; set; }
        public string RoleName { get; set; }
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
        public int PostsCount { get; set; }
        public IEnumerable<GetUserUseCaseDto> UserUseCases { get; set; }
        public IEnumerable<LikeDto> CommentLikes { get; set; }
        public IEnumerable<GetUserPostsDto> UserPosts { get; set; }
        public IEnumerable<GetUserCommentsDto> UserComments { get; set; }
    }
}