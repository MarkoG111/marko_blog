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
            var query = _context.Posts.AsQueryable();

            // FILTERI
            if (!string.IsNullOrWhiteSpace(search.Title))
            {
                query = query.Where(x => x.Title.ToLower().Contains(search.Title.ToLower()));
            }

            if (search.CategoryIds != null && search.CategoryIds.Any())
            {
                query = query.Where(x => x.PostCategories.Any(pc => search.CategoryIds.Contains(pc.IdCategory)));
            }

            // TOTAL COUNT POSLE FILTERA
            var totalCount = query.Count();

            query = search.SortOrder?.ToLower() == "asc"
                ? query.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id)
                : query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id);

            var skip = (search.Page - 1) * search.PerPage;

            var items = query
                .Skip(skip)
                .Take(search.PerPage)
                .Select(x => new GetPostsDto
                {
                    Id = x.Id,
                    Title = x.Title,
                    DateCreated = x.CreatedAt,
                    Username = x.User.Username,
                    ImageName = x.Image.ImagePath,
                    Categories = x.PostCategories.Select(pc => new GetPostCategoriesDto
                    {
                        Id = pc.Category.Id,
                        Name = pc.Category.Name
                    }).ToList()
                })
                .ToList();

            return new PagedResponse<GetPostsDto>
            {
                CurrentPage = search.Page,
                ItemsPerPage = search.PerPage,
                TotalCount = totalCount,
                Items = items
            };
        }

    }
}