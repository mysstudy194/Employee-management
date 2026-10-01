namespace EmployeeManagement.Domain.DTOs.Common;

public class ErrorResponseDto
{
    public int StatusCode { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Detailed { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}