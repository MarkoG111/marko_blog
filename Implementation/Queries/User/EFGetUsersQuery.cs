using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Application.DataTransfer.Users;
using Application.Queries;
using Application.Queries.User;
using Application.Searches;
using EFDataAccess;
using Microsoft.EntityFrameworkCore;

namespace Implementation.Queries.User
{
    public class EFGetUsersQuery : IGetUsersQuery
    {
        private readonly BlogContext _context;

        public EFGetUsersQuery(BlogContext context)
        {
            _context = context;
        }

        public int Id => (int)UseCaseEnum.EFGetUsersQuery;
        public string Name => UseCaseEnum.EFGetUsersQuery.ToString();

        public PagedResponse<GetUsersDto> Execute(UserSearch search)
        {
            var users = _context.Users.Include(x => x.Role).AsQueryable();

            if (search.OnlyAuthors) {
                users = users.Where(x => x.Role.Name == "Author");
            }

            if (!string.IsNullOrWhiteSpace(search.Username))
            {
                users = users.Where(x => x.Username.ToLower().Contains(search.Username.ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(search.Email))
            {
                users = users.Where(x => x.Email.ToLower().Contains(search.Email.ToLower()));
            }

            var skipCount = search.PerPage * (search.Page - 1);
            DateTime thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            var response = new PagedResponse<GetUsersDto>
            {
                CurrentPage = search.Page,
                ItemsPerPage = search.PerPage,
                TotalCount = users.Count(),
                LastMonthCount = users.Where(x => x.CreatedAt >= thirtyDaysAgo).Count(),

                Items = users.Skip(skipCount).Take(search.PerPage).Select(x => new GetUsersDto
                {
                    Id = x.Id,
                    FirstName = x.FirstName,
                    LastName = x.LastName,
                    Username = x.Username,
                    Email = x.Email,
                    ProfilePicture = x.ProfilePicture,
                    RoleName = x.Role.Name,
                    CreatedAt = x.CreatedAt
                }).ToList()
            };

            return response;
        }
    }
}
