using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Domain.DTOs.LeaveRequest;

public class UpdateLeaveStatusDto
{
    [Required]
    [RegularExpression("^(Approved|Rejected)$", ErrorMessage = "Status must be either 'Approved' or 'Rejected'.")]
    public string Status { get; set; } = string.Empty;
}