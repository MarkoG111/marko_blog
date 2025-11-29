using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Commands.Post;
using Application.Exceptions;
using EFDataAccess;
using FluentValidation;
using Implementation.Validators.Post;

namespace Implementation.Commands.Post
{
    public class EFDeletePostCommand : IDeletePostCommand
    {
        private readonly BlogContext _context;
        private readonly DeletePostValidator _validator;

        public EFDeletePostCommand(BlogContext context, DeletePostValidator validator)
        {
            _context = context;
            _validator = validator;
        }

        public int Id => (int)UseCaseEnum.EFDeletePostCommand;
        public string Name => UseCaseEnum.EFDeletePostCommand.ToString();

        public void Execute(int request)
        { 
            _validator.ValidateAndThrow(request);

            var post = _context.Posts.Find(request);

            if (post == null)
            {
                throw new EntityNotFoundException(request, typeof(Domain.Post));
            }

            if (post.IsDeleted)
            {
                throw new AlreadyDeletedException(request, typeof(Domain.Post));
            }

            post.DeletedAt = DateTime.UtcNow;
            post.IsActive = false;
            post.IsDeleted = true;

            _context.SaveChanges();
        }
    }
}