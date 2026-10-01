using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Domain.DTOs.Employee;

public class UpdateEmployeeDto
{
    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string LastName { get; set; } = string.Empty;

    [Phone]
    public string Phone { get; set; } = string.Empty;

    [Range(0, 1000000)]
    public decimal Salary { get; set; }

    [Required]
    public int DepartmentId { get; set; }
}