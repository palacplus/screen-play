using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using StreamSelect.Models;

namespace StreamSelect.Data;

public class StreamDbContext : DbContext
{
    public StreamDbContext(DbContextOptions<StreamDbContext> options) : base(options) { }
    public DbSet<Movie> Movies { get; set; }
}
