using Duende.IdentityServer.EntityFramework.Options;
using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ScreenPlay.Server.Models;

namespace ScreenPlay.Server.Data;

public class AppDbContext : ApiAuthorizationDbContext<AppUser>
{
    public AppDbContext(DbContextOptions options, IOptions<OperationalStoreOptions> operationalStoreOptions)
        : base(options, operationalStoreOptions) { }

    public DbSet<TokenInfo> Tokens { get; set; }

    public DbSet<Movie> Movies { get; set; }
    public DbSet<Image> Images { get; set; }
    public DbSet<Rating> Ratings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Movie>().HasKey(m => m.Id);
        modelBuilder.Entity<Movie>().Property(m => m.ImdbId).IsRequired();
        modelBuilder.Entity<Movie>().Property(m => m.TmdbId).IsRequired();

        modelBuilder
            .Entity<Movie>()
            .HasMany(m => m.Images)
            .WithOne()
            .HasForeignKey(i => i.MovieId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<Movie>()
            .HasMany(m => m.Ratings)
            .WithOne()
            .HasForeignKey(r => r.MovieId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Image>().HasKey(i => i.Id);
        modelBuilder.Entity<Image>().Property(i => i.CoverType).IsRequired();
        modelBuilder.Entity<Image>().Property(i => i.RemoteUrl).IsRequired();

        modelBuilder.Entity<Rating>().HasKey(r => r.Id);
        modelBuilder.Entity<Rating>().Property(r => r.MovieId).IsRequired();
        modelBuilder.Entity<Rating>().Property(r => r.Source).IsRequired();
        modelBuilder.Entity<Rating>().Property(r => r.Type).IsRequired();
        modelBuilder.Entity<Rating>().Property(r => r.Value).IsRequired();
        modelBuilder.Entity<Rating>().Property(r => r.Votes).IsRequired();
    }
}
