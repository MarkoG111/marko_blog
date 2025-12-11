using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EFDataAccess.Configurations
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.Property(x => x.Content).IsRequired().HasMaxLength(250);
            builder.Property(x => x.Link).IsRequired().HasMaxLength(250);
            builder.Property(x => x.Type).IsRequired().HasColumnType("integer");
            builder.Property(x => x.IsRead).IsRequired().HasDefaultValue(false);
            builder.Property(x => x.FromIdUser).IsRequired(false);

            builder.HasOne(x => x.UserReceiver).WithMany().HasForeignKey(x => x.IdUser).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(x => x.FromUser).WithMany().HasForeignKey(x => x.FromIdUser).OnDelete(DeleteBehavior.NoAction);
        }
    }
}