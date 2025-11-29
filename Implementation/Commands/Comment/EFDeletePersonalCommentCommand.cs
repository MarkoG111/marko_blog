using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application;
using Application.Commands.Comment;
using Application.Exceptions;
using EFDataAccess;
using FluentValidation;
using Implementation.Validators.Comment;

namespace Implementation.Commands.Comment
{
    public class EFDeletePersonalCommentCommand : IDeletePersonalCommentCommand
    {
        private readonly BlogContext _context;
        private readonly IApplicationActor _actor;
        private readonly DeleteCommentValidator _validator;

        public EFDeletePersonalCommentCommand(BlogContext context, IApplicationActor actor, DeleteCommentValidator validator)
        {
            _context = context;
            _actor = actor;
            _validator = validator;
        }

        public int Id => (int)UseCaseEnum.EFDeletePersonalCommentCommand;
        public string Name => UseCaseEnum.EFDeletePersonalCommentCommand.ToString();

        public void Execute(int request)
        {
            _validator.ValidateAndThrow(request);

            var comment = _context.Comments.Find(request);

            if (comment == null)
            {
                throw new EntityNotFoundException(request, typeof(Domain.Comment));
            }

            if (_actor.Id != comment.IdUser)
            {
                throw new UnauthorizedUserAccessException(_actor, Name);
            }

            if (comment.IsDeleted == true)
            {
                throw new AlreadyDeletedException(request, typeof(Domain.Comment));
            }

            comment.DeletedAt = DateTime.UtcNow;
            comment.IsDeleted = true;
            comment.IsActive = false;

            _context.SaveChanges();
        }
    }
}