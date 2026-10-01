using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using EmployeeManagement.Domain.DTOs.Auth;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Domain.Services;
using EmployeeManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace EmployeeManagement.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(ApplicationDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task RegisterAsync(RegisterRequestDto request)
    {
        bool exists = await _context.Users.AnyAsync(u => u.Username == request.Username || u.Email == request.Email);
        if (exists)
        {
            throw new InvalidOperationException("User already exists");
        }

        Role? role = await _context.Roles.FirstOrDefaultAsync(r => r.Name == request.Role);
        if (role == null)
        {
            role = new Role { Name = request.Role };
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
        }

        using HMACSHA512 hmac = new HMACSHA512();
        User user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.Password)),
            PasswordSalt = hmac.Key,
            RoleId = role.Id,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        GenerateAuthResponse(user, role.Name);
        await Task.CompletedTask;
    }

    public async Task LoginAsync(LoginRequestDto request)
    {
        User? user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        using HMACSHA512 hmac = new HMACSHA512(user.PasswordSalt);
        byte[] computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.Password));

        if (!computedHash.SequenceEqual(user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        Role? role = await _context.Roles.FindAsync(user.RoleId);
        string roleName = role?.Name ?? "Employee";

        GenerateAuthResponse(user, roleName);
        await Task.CompletedTask;
    }

    private AuthResponseDto GenerateAuthResponse(User user, string roleName)
    {
        IConfigurationSection jwtSettings = _config.GetSection("Jwt");
        byte[] secretKey = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "SuperSecretKeyForEmployeeManagementSystem2026!#@$");
        DateTime expiresAt = DateTime.UtcNow.AddMinutes(120);

        Claim[] claims = new Claim[4]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, roleName)
        };

        SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = jwtSettings["Issuer"] ?? "EmployeeManagementAPI",
            Audience = jwtSettings["Audience"] ?? "EmployeeManagementUsers",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKey), SecurityAlgorithms.HmacSha256Signature)
        };

        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
        SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

        return new AuthResponseDto
        {
            Token = tokenHandler.WriteToken(token),
            Username = user.Username,
            Role = roleName,
            ExpiresAt = expiresAt
        };
    }
}