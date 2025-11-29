using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Commands.Comment;
using Application.Exceptions;
using EFDataAccess;

namespace Implementation.Commands.Comment
{
    public class EFDeleteCommentCommand : IDeleteCommentCommand
    {
        private readonly BlogContext _context;

        public EFDeleteCommentCommand(BlogContext context)
        {
            _context = context;
        }

        public int Id => (int)UseCaseEnum.EFDeleteCommentCommand;
        public string Name => UseCaseEnum.EFDeleteCommentCommand.ToString();

        public void Execute(int request)
        {
            var comment = _context.Comments.Find(request);

            if (comment == null)
            {
                throw new EntityNotFoundException(request, typeof(Domain.Comment));
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