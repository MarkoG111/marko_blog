using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application;
using Application.Commands.Post;
using Application.Exceptions;
using EFDataAccess;

namespace Implementation.Commands.Post
{
    public class EFDeletePersonalPostCommand : IDeletePersonalPostCommand
    {
        private readonly BlogContext _context;
        private readonly IApplicationActor _actor;

        public EFDeletePersonalPostCommand(BlogContext context, IApplicationActor actor)
        {
            _context = context;
            _actor = actor;
        }

        public int Id => (int)UseCaseEnum.EFDeletePersonalPostCommand;
        public string Name => UseCaseEnum.EFDeletePersonalPostCommand.ToString();

        public void Execute(int request)
        {
            var post = _context.Posts.Find(request);

            if (post == null)
            {
                throw new EntityNotFoundException(request, typeof(Domain.Post));
            }

            if (_actor.Id != post.IdUser)
            {
                throw new UnauthorizedUserAccessException(_actor, Name);
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