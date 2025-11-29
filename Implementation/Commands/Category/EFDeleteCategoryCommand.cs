using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Commands.Category;
using Application.Exceptions;
using EFDataAccess;
using FluentValidation;
using Implementation.Validators.Category;
using Microsoft.EntityFrameworkCore;

namespace Implementation.Commands.Category
{
    public class EFDeleteCategoryCommand : IDeleteCategoryCommand
    {
        private readonly BlogContext _context;
        private readonly DeleteCategoryValidator _validator;

        public EFDeleteCategoryCommand(BlogContext context, DeleteCategoryValidator validator)
        {
            _context = context;
            _validator = validator;
        }

        public int Id => (int)UseCaseEnum.EFDeleteCategoryCommand;
        public string Name => UseCaseEnum.EFDeleteCategoryCommand.ToString();
        public void Execute(int id)
        {
            _validator.ValidateAndThrow(id);

            var category = _context.Categories.Include(x => x.CategoryPosts).FirstOrDefault(x => x.Id == id);

            if (category == null)
            {
                throw new EntityNotFoundException(id, typeof(Domain.Category));
            }

            if (category.CategoryPosts.Count > 0)
            {
                throw new ConflictException("Category is not empty.");
            }

            if (category.IsDeleted == true)
            {
                throw new AlreadyDeletedException(id, typeof(Domain.Category));
            }

            category.DeletedAt = DateTime.UtcNow;
            category.IsDeleted = true;
            category.IsActive = false;

            _context.SaveChanges();
        }
    }
}