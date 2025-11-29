using Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using BCrypt.Net;

namespace EFDataAccess.Seed
{
    public static class DataSeeder
    {
        private static readonly Random rnd = new Random();
        private static readonly string defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

        // Mapiranje kategorija na SAMO IME fajla (bez putanje)
        private static readonly Dictionary<string, string> CategoryImageMap = new Dictionary<string, string>
        {
            { "HTML", "html-post.png" },
            { "CSS", "css-post.png" },
            { "JavaScript", "javascript-post.png" },
            { "MySQL", "mysql-post.png" },
            { "PHP", "php-post.png" },
            { "Database Design", "database-post.png" },
            { "SCSS", "scss-post.png" }
        };

        public static void SeedInitialData(BlogContext context)
        {
            // context.Database.Migrate();

            if (!context.Roles.Any())
            {
                SeedRoles(context);
                context.SaveChanges();
            }

            if (!context.Users.Any())
            {
                SeedUsers(context);
                context.SaveChanges();

                SeedUserUseCases(context);
                context.SaveChanges();
            }

            if (!context.Categories.Any())
            {
                SeedCategories(context);
                context.SaveChanges();
            }

            if (!context.Images.Any())
            {
                SeedImages(context);
                context.SaveChanges();
            }

            if (!context.Posts.Any())
            {
                SeedPosts(context);
                context.SaveChanges();
            }

            if (!context.PostCategories.Any())
            {
                SeedPostCategories(context);
                context.SaveChanges();
            }

            if (!context.Comments.Any())
            {
                SeedComments(context);
                context.SaveChanges();
            }

            if (!context.Followers.Any())
            {
                SeedFollowers(context);
                context.SaveChanges();
            }

            if (!context.Likes.Any())
            {
                SeedLikes(context);
                context.SaveChanges();
            }

            if (!context.Notifications.Any())
            {
                SeedNotifications(context);
                context.SaveChanges();
            }
        }

        private static void SeedRoles(BlogContext context)
        {
            var roles = new List<Role>
            {
                new Role { Name = "Admin", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Role { Name = "User", IsActive = true, CreatedAt = DateTime.UtcNow },
                new Role { Name = "Author", IsActive = true, CreatedAt = DateTime.UtcNow }
            };

            context.Roles.AddRange(roles);
        }

        private static void SeedUsers(BlogContext context)
        {
            // 1 = Admin, 2 = User, 3 = Author
            var users = new List<User>
            {
                // Admin
                new User {
                    FirstName="Admin", LastName="User", Username="admin",
                    Email="admin@blog.com", Password=BCrypt.Net.BCrypt.HashPassword("admin123"),
                    IdRole=1, ProfilePicture=defaultAvatar, CreatedAt=DateTime.UtcNow, IsActive=true
                },
                
                // Regular Users
                new User {
                    FirstName="John", LastName="Doe", Username="john_doe",
                    Email="john@blog.com", Password=BCrypt.Net.BCrypt.HashPassword("john123"),
                    IdRole=2, ProfilePicture=defaultAvatar, CreatedAt=DateTime.UtcNow, IsActive=true
                },
                new User {
                    FirstName="Mark", LastName="Brown", Username="mark_b",
                    Email="mark@blog.com", Password=BCrypt.Net.BCrypt.HashPassword("pass123"),
                    IdRole=2, ProfilePicture=defaultAvatar, CreatedAt=DateTime.UtcNow, IsActive=true
                },
                new User {
                    FirstName="Tina", LastName="Smith", Username="tina_s",
                    Email="tina@blog.com", Password=BCrypt.Net.BCrypt.HashPassword("pass123"),
                    IdRole=2, ProfilePicture=defaultAvatar, CreatedAt=DateTime.UtcNow, IsActive=true
                },
                
                // Authors 
                new User {
                    FirstName="Emily", LastName="Stone", Username="emily_s",
                    Email="emily@blog.com", Password=BCrypt.Net.BCrypt.HashPassword("pass123"),
                    IdRole=3, ProfilePicture=defaultAvatar, CreatedAt=DateTime.UtcNow, IsActive=true
                },
                new User {
                    FirstName="David", LastName="Johnson", Username="david_j",
                    Email="david@blog.com", Password=BCrypt.Net.BCrypt.HashPassword("pass123"),
                    IdRole=3, ProfilePicture=defaultAvatar, CreatedAt=DateTime.UtcNow, IsActive=true
                },
                new User {
                    FirstName="Sarah", LastName="Williams", Username="sarah_w",
                    Email="sarah@blog.com", Password=BCrypt.Net.BCrypt.HashPassword("pass123"),
                    IdRole=3, ProfilePicture=defaultAvatar, CreatedAt=DateTime.UtcNow, IsActive=true
                },
                new User {
                    FirstName="Michael", LastName="Davis", Username="michael_d",
                    Email="michael@blog.com", Password=BCrypt.Net.BCrypt.HashPassword("pass123"),
                    IdRole=3, ProfilePicture=defaultAvatar, CreatedAt=DateTime.UtcNow, IsActive=true
                },
            };

            context.Users.AddRange(users);

            // Dodatnih 5 random usera
            for (int i = 0; i < 5; i++)
            {
                context.Users.Add(new User
                {
                    FirstName = "User" + i,
                    LastName = "Random",
                    Username = "user" + i,
                    Email = $"user{i}@blog.com",
                    Password = BCrypt.Net.BCrypt.HashPassword("user123"),
                    IdRole = 2,
                    ProfilePicture = defaultAvatar,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                });
            }
        }

        private static void SeedUserUseCases(BlogContext context)
        {
            var users = context.Users.ToList();

            foreach (var user in users)
            {
                var useCasesForUser = GetUseCasesForRole(user.IdRole);

                foreach (var useCaseId in useCasesForUser)
                {
                    if (!context.UserUseCases.Any(x => x.IdUser == user.Id && x.IdUseCase == useCaseId))
                    {
                        context.UserUseCases.Add(new UserUseCase
                        {
                            IdUser = user.Id,
                            IdUseCase = useCaseId
                        });
                    }
                }
            }
        }

        private static List<int> GetUseCasesForRole(int roleId)
        {
            switch (roleId)
            {
                case 1: // Admin
                    return new List<int> {
                        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                        20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40
                    };

                case 2: // User
                default:
                    return new List<int> {
                        5, 6, 9, 12, 13, 14, 15, 16, 17, 18, 19,
                        21, 23, 24, 28, 29, 30, 33, 34, 35, 38, 39, 40, 36, 37
                    };

                case 3: // Author
                    return new List<int> {
                        2, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19,
                        21, 23, 24, 28, 29, 31, 33, 34, 35, 38, 39, 40, 36, 37
                    };
            }
        }

        private static void SeedCategories(BlogContext context)
        {
            string[] names = { "HTML", "CSS", "JavaScript", "MySQL", "PHP", "Database Design", "SCSS" };
            foreach (var name in names)
                context.Categories.Add(new Category { Name = name, CreatedAt = DateTime.UtcNow, IsActive = true });
        }

        private static void SeedImages(BlogContext context)
        {
            foreach (var imageName in CategoryImageMap.Values)
            {
                context.Images.Add(new Image
                {
                    ImagePath = imageName, // Samo ime fajla: "html-post.png"
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                });
            }
        }

        private static void SeedPosts(BlogContext context)
        {
            // Samo autori (IdRole = 3) mogu da kreiraju postove
            var authorIds = context.Users.Where(u => u.IdRole == 3).Select(u => u.Id).ToList();

            if (!authorIds.Any())
            {
                Console.WriteLine("Warning: No authors found. Cannot seed posts.");
                return;
            }

            var categories = context.Categories.ToList();
            var images = context.Images.ToList();

            if (!categories.Any() || !images.Any()) return;

            // Kreiram 5 postova po kategoriji (ukupno 35 postova)
            int postCounter = 1;
            foreach (var category in categories)
            {
                // Pronađem odgovarajuću sliku za ovu kategoriju
                var categoryImage = images.FirstOrDefault(img =>
                    CategoryImageMap.ContainsKey(category.Name) &&
                    img.ImagePath == CategoryImageMap[category.Name]
                );

                // Ako ne nađem specifičnu sliku, uzmem random
                if (categoryImage == null)
                    categoryImage = images[rnd.Next(images.Count)];

                // Kreiram 5 postova za ovu kategoriju
                for (int i = 0; i < 5; i++)
                {
                    var randomAuthor = authorIds[rnd.Next(authorIds.Count)];

                    context.Posts.Add(new Post
                    {
                        Title = $"{category.Name} Tutorial - Part {i + 1}",
                        Content = $"This is an in-depth tutorial about {category.Name}. " +
                                  $"Learn the fundamentals and advanced concepts. " +
                                  $"Post #{postCounter}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                        IdUser = randomAuthor,
                        IdImage = categoryImage.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-rnd.Next(1, 60)), // Random datum u poslednjih 60 dana
                        IsActive = true
                    });

                    postCounter++;
                }
            }
        }

        private static void SeedPostCategories(BlogContext context)
        {
            var posts = context.Posts.Include(p => p.Image).ToList();
            var categories = context.Categories.ToList();

            if (!posts.Any() || !categories.Any()) return;

            foreach (var post in posts)
            {
                // Pronađem primarnu kategoriju na osnovu slike posta
                var primaryCategory = categories.FirstOrDefault(c =>
                    CategoryImageMap.ContainsKey(c.Name) &&
                    post.Image != null &&
                    post.Image.ImagePath == CategoryImageMap[c.Name]
                );

                if (primaryCategory != null)
                {
                    // Dodaj primarnu kategoriju
                    context.PostCategories.Add(new PostCategory
                    {
                        IdPost = post.Id,
                        IdCategory = primaryCategory.Id
                    });

                    // Šansa da dodam još 1-2 related kategorije
                    int additionalCategories = rnd.Next(0, 3); // 0, 1 ili 2
                    var usedCategories = new HashSet<int> { primaryCategory.Id };

                    for (int j = 0; j < additionalCategories; j++)
                    {
                        var randomCategory = categories[rnd.Next(categories.Count)];
                        if (!usedCategories.Contains(randomCategory.Id))
                        {
                            usedCategories.Add(randomCategory.Id);
                            context.PostCategories.Add(new PostCategory
                            {
                                IdPost = post.Id,
                                IdCategory = randomCategory.Id
                            });
                        }
                    }
                }
                else
                {
                    // Fallback: dodaj 1-3 random kategorije
                    int catCount = rnd.Next(1, 4);
                    var usedCategories = new HashSet<int>();

                    for (int j = 0; j < catCount; j++)
                    {
                        var randomCategory = categories[rnd.Next(categories.Count)];
                        if (!usedCategories.Contains(randomCategory.Id))
                        {
                            usedCategories.Add(randomCategory.Id);
                            context.PostCategories.Add(new PostCategory
                            {
                                IdPost = post.Id,
                                IdCategory = randomCategory.Id
                            });
                        }
                    }
                }
            }
        }

        private static void SeedComments(BlogContext context)
        {
            var postIds = context.Posts.Select(p => p.Id).ToList();
            var userIds = context.Users.Select(u => u.Id).ToList();

            if (!postIds.Any() || !userIds.Any()) return;

            for (int i = 1; i <= 50; i++)
            {
                context.Comments.Add(new Comment
                {
                    CommentText = $"Great post! Comment #{i}. Lorem ipsum dolor sit amet.",
                    IdUser = userIds[rnd.Next(userIds.Count)],
                    IdPost = postIds[rnd.Next(postIds.Count)],
                    IdParent = null,
                    CreatedAt = DateTime.UtcNow.AddDays(-rnd.Next(1, 30)),
                    IsActive = true
                });
            }
        }

        private static void SeedFollowers(BlogContext context)
        {
            var userIds = context.Users.Select(u => u.Id).ToList();
            if (userIds.Count < 2) return;

            var generatedPairs = new HashSet<string>();
            int count = 0;
            int attempts = 0;

            while (count < 20 && attempts < 100)
            {
                attempts++;
                var follower = userIds[rnd.Next(userIds.Count)];
                var following = userIds[rnd.Next(userIds.Count)];

                if (follower == following) continue;

                string key = $"{follower}-{following}";

                if (generatedPairs.Contains(key)) continue;
                if (context.Followers.Any(f => f.IdFollower == follower && f.IdFollowing == following)) continue;

                generatedPairs.Add(key);

                context.Followers.Add(new Follower
                {
                    IdFollower = follower,
                    IdFollowing = following,
                    FollowedAt = DateTime.UtcNow.AddDays(-rnd.Next(1, 90))
                });

                count++;
            }
        }

        private static void SeedLikes(BlogContext context)
        {
            var postIds = context.Posts.Select(p => p.Id).ToList();
            var userIds = context.Users.Select(u => u.Id).ToList();
            var commentIds = context.Comments.Select(c => c.Id).ToList();

            if (!userIds.Any() || !postIds.Any()) return;

            var generatedLikes = new HashSet<string>();

            for (int i = 0; i < 100; i++)
            {
                var userId = userIds[rnd.Next(userIds.Count)];
                int postId;
                int? commentId = null;

                // 30% šanse da lajkuje komentar, 70% post
                if (commentIds.Any() && rnd.Next(1, 11) <= 3)
                {
                    commentId = commentIds[rnd.Next(commentIds.Count)];
                    postId = postIds[rnd.Next(postIds.Count)];
                }
                else
                {
                    postId = postIds[rnd.Next(postIds.Count)];
                }

                // Provera duplikata
                string key = $"{userId}-{postId}-{commentId}";
                if (generatedLikes.Contains(key)) continue;
                generatedLikes.Add(key);

                context.Likes.Add(new Like
                {
                    IdUser = userId,
                    IdPost = postId,
                    IdComment = commentId,
                    Status = LikeStatus.Liked,
                    CreatedAt = DateTime.UtcNow.AddDays(-rnd.Next(1, 30))
                });
            }
        }

        private static void SeedNotifications(BlogContext context)
        {
            var userIds = context.Users.Select(u => u.Id).ToList();
            var postIds = context.Posts.Select(p => p.Id).ToList();

            if (!userIds.Any()) return;

            for (int i = 0; i < 30; i++)
            {
                var userId = userIds[rnd.Next(userIds.Count)];
                var fromUserId = userIds[rnd.Next(userIds.Count)];

                // Provera da notifikacija nije od sebe
                if (userId == fromUserId) continue;

                var link = postIds.Any() ? $"/post/{postIds[rnd.Next(postIds.Count)]}" : "#";

                context.Notifications.Add(new Notification
                {
                    IdUser = userId,
                    FromIdUser = fromUserId,
                    Type = (NotificationType)rnd.Next(1, 4),
                    Content = $"You have a notification #{i + 1}",
                    Link = link,
                    CreatedAt = DateTime.UtcNow.AddDays(-rnd.Next(0, 7)),
                    IsRead = rnd.Next(1, 11) > 3 // 70% su pročitane
                });
            }
        }
    }
}