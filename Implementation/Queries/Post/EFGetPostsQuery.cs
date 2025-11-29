using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Application.DataTransfer.Posts;
using Application.Queries;
using Application.Queries.Post;
using Application.Searches;
using EFDataAccess;

namespace Implementation.Queries.Post
{
    public class EFGetPostsQuery : IGetPostsQuery
    {
        private readonly BlogContext _context;

        public EFGetPostsQuery(BlogContext context)
        {
            _context = context;
        }

        public int Id => (int)UseCaseEnum.EFGetPostsQuery;
        public string Name => UseCaseEnum.EFGetPostsQuery.ToString();

        public PagedResponse<GetPostsDto> Execute(PostSearch search)
        {
            var posts = _context.Posts.Include(x => x.PostCategories).ThenInclude(x => x.Category).AsQueryable();

            var totalCount = posts.Count();

            if (!string.IsNullOrWhiteSpace(search.Title))
            {
                posts = posts.Where(x => x.Title.ToLower().Contains(search.Title.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(search.Content))
            {
                posts = posts.Where(x => x.Content.ToLower().Contains(search.Content.ToLower()));
            }

            if (search.CategoryIds != null && search.CategoryIds.Any())
            {
                posts = posts.Where(x => x.PostCategories.Any(pc => search.CategoryIds.Contains(pc.IdCategory)));
            }

            if (search.SortOrder != null)
            {
                posts = search.SortOrder.ToLower() == "asc" ? posts.OrderBy(x => x.CreatedAt) : posts.OrderByDescending(x => x.CreatedAt);
            }

            var skipCount = search.PerPage * (search.Page - 1);
            DateTime thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            var response = new PagedResponse<GetPostsDto>
            {
                CurrentPage = search.Page,
                ItemsPerPage = search.PerPage,
                TotalCount = totalCount,
                LastMonthCount = posts.Where(x => x.CreatedAt >= thirtyDaysAgo).Count(),

                Items = posts.Skip(skipCount).Take(search.PerPage).Select(x => new GetPostsDto
                {
                    Id = x.Id,
                    Title = x.Title,
                    DateCreated = x.CreatedAt,
                    Username = x.User.Username,
                    ImageName = x.Image.ImagePath,
                    Categories = x.PostCategories.Select(y => new GetPostCategoriesDto
                    {
                        Id = y.Category.Id,
                        Name = y.Category.Name
                    }).ToList(),
                }).ToList()
            };

            return response;
        }
    }
}