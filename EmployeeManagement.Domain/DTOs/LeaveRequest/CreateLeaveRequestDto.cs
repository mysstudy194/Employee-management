using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Domain.DTOs.LeaveRequest;

public class CreateLeaveRequestDto
{
    [Required]
    public int EmployeeId { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Required]
    [MaxLength(250)]
    public string Reason { get; set; } = string.Empty;
}