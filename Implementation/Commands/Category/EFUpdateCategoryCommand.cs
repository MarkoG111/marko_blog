using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Commands.Category;
using Application.DataTransfer.Categories;
using Application.Exceptions;
using EFDataAccess;
using FluentValidation;
using Implementation.Validators.Category;

namespace Implementation.Commands.Category
{
    public class EFUpdateCategoryCommand : IUpdateCategoryCommand
    {
        private readonly BlogContext _context;
        private readonly UpdateCategoryValidator _validator;

        public EFUpdateCategoryCommand(UpdateCategoryValidator validator, BlogContext context)
        {
            _validator = validator;
            _context = context;
        }

        public int Id => (int)UseCaseEnum.EFUpdateCategoryCommand;
        public string Name => UseCaseEnum.EFUpdateCategoryCommand.ToString();

        public void Execute(UpsertCategoryDto request)
        {
            var category = _context.Categories.Find(request.Id);

            if (category == null)
            {
                throw new EntityNotFoundException(request.Id, typeof(Domain.Category));
            }

            _validator.ValidateAndThrow(request);

            category.Name = request.Name;
            category.ModifiedAt = DateTime.UtcNow;

            _context.SaveChanges();
        }
    }
}