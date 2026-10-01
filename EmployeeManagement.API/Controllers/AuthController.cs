using System;
using System.Threading.Tasks;
using EmployeeManagement.Domain.DTOs.Auth;
using EmployeeManagement.Domain.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            await _authService.RegisterAsync(request);
            Response.StatusCode = 200;
            await Response.WriteAsJsonAsync(new { message = "User registered successfully" });
        }
        catch (InvalidOperationException ex)
        {
            Response.StatusCode = 400;
            await Response.WriteAsJsonAsync(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            Response.StatusCode = 500;
            await Response.WriteAsJsonAsync(new { message = "An error occurred during registration", details = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task Login([FromBody] LoginRequestDto request)
    {
        try
        {
            await _authService.LoginAsync(request);
            Response.StatusCode = 200;
            await Response.WriteAsJsonAsync(new { message = "Login successful" });
        }
        catch (UnauthorizedAccessException ex)
        {
            Response.StatusCode = 401;
            await Response.WriteAsJsonAsync(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            Response.StatusCode = 500;
            await Response.WriteAsJsonAsync(new { message = "An error occurred during login", details = ex.Message });
        }
    }
}