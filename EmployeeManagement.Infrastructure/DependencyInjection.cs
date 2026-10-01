using EmployeeManagement.Domain.Services;
using EmployeeManagement.Infrastructure.Data;
using EmployeeManagement.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EmployeeManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddScoped(sp =>
        {
            var builder = new DbContextOptionsBuilder();
            builder.UseSqlServer(connectionString);
            return new ApplicationDbContext(builder.Options);
        });

        // Yeh wahi working code hai jo pehle bina error ke chala tha
        services.AddScoped(typeof(IAuthService), typeof(AuthService));

        return services;
    }
}