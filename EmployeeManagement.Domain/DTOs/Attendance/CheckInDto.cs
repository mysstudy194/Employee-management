using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Domain.DTOs.Attendance;

public class CheckInDto
{
    [Required]
    public int EmployeeId { get; set; }
}