using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Domain.DTOs.Attendance;

public class CheckOutDto
{
    [Required]
    public int EmployeeId { get; set; }
}