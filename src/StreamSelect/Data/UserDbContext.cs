using StreamSelect.Models;
using Duende.IdentityServer.EntityFramework.Options;
using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace StreamSelect.Data;

public class UserDbContext : ApiAuthorizationDbContext<AppUser>
{
    public UserDbContext(DbContextOptions options, IOptions<OperationalStoreOptions> operationalStoreOptions)
        : base(options, operationalStoreOptions) { }

    public DbSet<TokenInfo> Tokens { get; set; }
}
