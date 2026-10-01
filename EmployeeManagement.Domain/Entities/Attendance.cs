namespace EmployeeManagement.Domain.Entities;

public class Attendance
{
    public int Id { get; set; }

    public int EmployeeId { get; set; }

    public DateTime Date { get; set; }

    public DateTime? CheckInTime { get; set; }

    public DateTime? CheckOutTime { get; set; }

    public string Status { get; set; } = string.Empty;

    public Employee? Employee { get; set; }
}


