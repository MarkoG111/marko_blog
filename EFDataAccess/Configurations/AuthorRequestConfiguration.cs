using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EFDataAccess.Configurations
{
    public class AuthorRequestConfiguration : IEntityTypeConfiguration<AuthorRequest>
    {
        public void Configure(EntityTypeBuilder<AuthorRequest> builder)
        {
            builder.Property(x => x.IdUser).IsRequired();
            builder.Property(x => x.Reason).IsRequired();
            builder.Property(x => x.Status).HasColumnType("integer");
        }
    }
}