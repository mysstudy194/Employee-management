using System.Threading.Tasks;
using EmployeeManagement.Domain.DTOs.Auth;

namespace EmployeeManagement.Domain.Services;

public interface IAuthService
{
    Task RegisterAsync(RegisterRequestDto request);
    Task LoginAsync(LoginRequestDto request);
}