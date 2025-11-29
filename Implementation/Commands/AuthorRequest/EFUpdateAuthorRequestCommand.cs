using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Commands.AuthorRequest;
using Application.DataTransfer.AuthorRequests;
using Application.Exceptions;
using EFDataAccess;
using FluentValidation;
using Domain;
using Implementation.Extensions;

namespace Implementation.Commands.AuthorRequest
{
    public class EFUpdateAuthorRequestCommand : IUpdateAuthorRequestCommand
    {
        private readonly BlogContext _context;

        public EFUpdateAuthorRequestCommand(BlogContext context)
        {
            _context = context;
        }

        public int Id => (int)UseCaseEnum.EFUpdateAuthorRequestCommand;
        public string Name => UseCaseEnum.EFUpdateAuthorRequestCommand.ToString();

        public void Execute(UpsertAuthorRequestDto request)
        {
            var authorRequest = _context.AuthorRequests.Find(request.Id);

            if (authorRequest == null)
            {
                throw new EntityNotFoundException(request.Id, typeof(Domain.AuthorRequest));
            }

            authorRequest.Status = request.Status;
            authorRequest.ModifiedAt = DateTime.UtcNow;

            var user = _context.Users.FirstOrDefault(x => x.Id == authorRequest.IdUser);

            if (user != null)
            {
                if (request.Status == RequestStatus.Accepted)
                {
                    user.IdRole = request.IdRole;
                    user.UpdateUseCasesForRole(_context);
                }

                _context.SaveChanges();
            }
        }
    }
}