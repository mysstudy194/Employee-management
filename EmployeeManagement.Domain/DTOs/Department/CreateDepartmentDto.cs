using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Domain.DTOs.Department;

public class CreateDepartmentDto
{
    [Required(ErrorMessage = "Department name is required.")]
    [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}
