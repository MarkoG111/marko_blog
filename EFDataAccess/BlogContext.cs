using System;
using Microsoft.EntityFrameworkCore;
using Domain;
using EFDataAccess.Configurations;

namespace EFDataAccess
{
  public class BlogContext : DbContext
  {
    public BlogContext(DbContextOptions<BlogContext> options) : base(options)
    {
      
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
      modelBuilder.ApplyConfiguration(new PostConfiguration());
      modelBuilder.ApplyConfiguration(new CategoryConfiguration());
      modelBuilder.ApplyConfiguration(new PostCategoryConfiguration());
      modelBuilder.ApplyConfiguration(new ImageConfiguration());
      modelBuilder.ApplyConfiguration(new UserConfiguration());
      modelBuilder.ApplyConfiguration(new CommentConfiguration());
      modelBuilder.ApplyConfiguration(new LikeConfiguration());
      modelBuilder.ApplyConfiguration(new FollowerConfiguration());
      modelBuilder.ApplyConfiguration(new NotificationConfiguration());

      modelBuilder.Entity<Post>().HasQueryFilter(x => !x.IsDeleted);
      modelBuilder.Entity<Category>().HasQueryFilter(x => !x.IsDeleted);
      modelBuilder.Entity<PostCategory>().HasQueryFilter(x => !x.IsDeleted);
      modelBuilder.Entity<Image>().HasQueryFilter(x => !x.IsDeleted);
      modelBuilder.Entity<User>().HasQueryFilter(x => !x.IsDeleted);
      modelBuilder.Entity<Role>().HasQueryFilter(x => !x.IsDeleted);
      // modelBuilder.Entity<Comment>().HasQueryFilter(x => !x.IsDeleted);
      modelBuilder.Entity<Like>().HasQueryFilter(x => !x.IsDeleted);
      modelBuilder.Entity<UserUseCase>().HasQueryFilter(x => !x.IsDeleted);
      modelBuilder.Entity<AuthorRequest>().HasQueryFilter(x => !x.IsDeleted);
      modelBuilder.Entity<Notification>().HasQueryFilter(x => !x.IsDeleted);
    }

    public override int SaveChanges()
    {
      foreach (var entry in ChangeTracker.Entries())
      {
        if (entry.Entity is BaseEntity e)
        {
          switch (entry.State)
          {
            case EntityState.Added:
              e.CreatedAt = DateTime.UtcNow;
              e.IsActive = true;
              e.IsDeleted = false;
              e.DeletedAt = null;
              e.ModifiedAt = null;
              break;
            case EntityState.Modified:
              e.ModifiedAt = DateTime.UtcNow;
              break;
          }
        }
      }

      return base.SaveChanges();
    }

    public DbSet<Post> Posts { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<PostCategory> PostCategories { get; set; }
    public DbSet<Image> Images { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Like> Likes { get; set; }
    public DbSet<UserUseCase> UserUseCases { get; set; }
    public DbSet<UseCaseLog> UseCaseLogs { get; set; }
    public DbSet<AuthorRequest> AuthorRequests { get; set; }
    public DbSet<Follower> Followers { get; set; }
    public DbSet<Notification> Notifications { get; set; }
  }
}

