using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace EFDataAccess
{
    public class BlogContextFactory : IDesignTimeDbContextFactory<BlogContext>
    {
        public BlogContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<BlogContext>();

            var cs = Environment.GetEnvironmentVariable("DefaultConnection")
                     ?? "Host=localhost;Port=5432;Database=blog;Username=postgres;Password=postgres";

            optionsBuilder.UseNpgsql(cs);

            return new BlogContext(optionsBuilder.Options);
        }
    }
}
