using EFDataAccess.Seed;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace EFDataAccess
{
    public static class SeedRunner
    {
        public static void Run(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BlogContext>();

            // context.Database.Migrate();

            DataSeeder.SeedInitialData(context);
        }
    }
}
