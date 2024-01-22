using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Duende.IdentityServer.EntityFramework.Options;
using Climax.Models;

namespace Climax.Data;

public class ClimaxDbContext : DbContext
{
    public ClimaxDbContext(DbContextOptions<ClimaxDbContext> options) : base(options) { }
    public DbSet<Movie> Movies { get; set; }
}
