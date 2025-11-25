using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Application.DataTransfer.Users;
using Application.DataTransfer.Posts;
using Application.DataTransfer.UseCases;
using Application.DataTransfer.Likes;
using Application.DataTransfer.Comments;
using Application.Queries.User;
using EFDataAccess;

namespace Implementation.Queries.User
{
    public class EFGetOneUserQuery : IGetUserQuery
    {
        private readonly BlogContext _context;

        public EFGetOneUserQuery(BlogContext context)
        {
            _context = context;
        }

        public int Id => (int)UseCaseEnum.EFGetOneUserQuery;
        public string Name => UseCaseEnum.EFGetOneUserQuery.ToString();

        public GetUserDto Execute(int idUser)
        {
            var user = _context.Users
            .AsNoTracking()
            .Include(x => x.UserUseCases)
            .Include(u => u.Role)
            .Include(p => p.Posts)
                .ThenInclude(bc => bc.PostCategories)
                .ThenInclude(cat => cat.Category)
            .Include(p => p.Posts)
                .ThenInclude(i => i.Image) // Separate include for Image
            .Include(c => c.Comments)
                .ThenInclude(pos => pos.Post)
                .ThenInclude(i => i.Image)
            .Include(l => l.Likes)
            .Where(x => x.Id == idUser)
            .Select(user => new
            {
                User = user,
                FollowersCount = _context.Followers.Count(f => f.IdFollowing == idUser),
                FollowingCount = _context.Followers.Count(f => f.IdFollower == idUser),
                PostsCount = user.Posts.Count
            })
            .FirstOrDefault();

            if (user == null)
            {
                return null;
            }

            return new GetUserDto
            {
                Id = user.User.Id,
                FirstName = user.User.FirstName,
                LastName = user.User.LastName,
                Username = user.User.Username,
                Email = user.User.Email,
                ProfilePicture = user.User.ProfilePicture,
                RoleName = user.User.Role.Name,
                IdRole = user.User.Role.Id,
                UserUseCases = user.User.UserUseCases.Select(x => new GetUserUseCaseDto
                {
                    IdUseCase = x.IdUseCase,
                    UseCaseName = Enum.GetName(typeof(UseCaseEnum), x.IdUseCase)
                }).ToList(),
                UserPosts = user.User.Posts.OrderByDescending(p => p.CreatedAt).Select(p => new GetUserPostsDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    ImageName = p.Image?.ImagePath,
                    DateCreated = p.CreatedAt,
                    IdUser = p.IdUser,
                    Categories = p.PostCategories.Select(y => new GetPostCategoriesDto
                    {
                        Id = y.Category.Id,
                        Name = y.Category.Name
                    }).ToList()
                }).ToList(),
                UserComments = user.User.Comments.Select(c => new GetUserCommentsDto
                {
                    Id = c.Id,
                    CommentText = c.CommentText,
                    PostTitle = c.Post.Title,
                    CreatedAt = c.CreatedAt
                }).ToList(),
                CommentLikes = user.User.Likes.Select(l => new LikeDto
                {
                    IdUser = l.IdUser,
                    IdPost = l.IdPost,
                    IdComment = l.IdComment,
                    Status = l.Status
                }).ToList(),
                FollowersCount = user.FollowersCount,
                FollowingCount = user.FollowingCount,
                PostsCount = user.PostsCount
            };
        }
    }
}