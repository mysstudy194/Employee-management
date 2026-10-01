using EmployeeManagement.Domain.DTOs.Attendance;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttendancesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AttendancesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/attendances
    [HttpGet]
    public IActionResult GetAllAttendances()
    {
        var records = _context.Attendances
            .Include(a => a.Employee)
            .OrderByDescending(a => a.Date)
            .Select(a => new AttendanceDto
            {
                Id = a.Id,
                EmployeeId = a.EmployeeId,
                EmployeeName = a.Employee != null ? $"{a.Employee.FirstName} {a.Employee.LastName}" : null,
                Date = a.Date,
                CheckInTime = a.CheckInTime,
                CheckOutTime = a.CheckOutTime,
                Status = a.Status
            })
            .ToList();

        return Ok(records);
    }

    // GET: api/attendances/employee/1
    [HttpGet("employee/{employeeId}")]
    public IActionResult GetAttendanceByEmployee(int employeeId)
    {
        var records = _context.Attendances
            .Where(a => a.EmployeeId == employeeId)
            .OrderByDescending(a => a.Date)
            .Select(a => new AttendanceDto
            {
                Id = a.Id,
                EmployeeId = a.EmployeeId,
                Date = a.Date,
                CheckInTime = a.CheckInTime,
                CheckOutTime = a.CheckOutTime,
                Status = a.Status
            })
            .ToList();

        return Ok(records);
    }

    // POST: api/attendances/check-in
    [HttpPost("check-in")]
    public IActionResult CheckIn([FromBody] CheckInDto dto)
    {
        var employee = _context.Employees.Find(dto.EmployeeId);
        if (employee == null)
        {
            return NotFound(new { message = $"Employee with ID {dto.EmployeeId} not found." });
        }

        var today = DateTime.UtcNow.Date;
        var now = DateTime.UtcNow;

        var existingAttendance = _context.Attendances
            .FirstOrDefault(a => a.EmployeeId == dto.EmployeeId && a.Date == today);

        if (existingAttendance != null && existingAttendance.CheckInTime != null)
        {
            return BadRequest(new { message = "Employee has already checked in today." });
        }

        if (existingAttendance == null)
        {
            existingAttendance = new Attendance
            {
                EmployeeId = dto.EmployeeId,
                Date = today,
                CheckInTime = now,
                Status = "Present"
            };
            _context.Attendances.Add(existingAttendance);
        }
        else
        {
            existingAttendance.CheckInTime = now;
            existingAttendance.Status = "Present";
        }

        _context.SaveChanges();

        return Ok(new AttendanceDto
        {
            Id = existingAttendance.Id,
            EmployeeId = existingAttendance.EmployeeId,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            Date = existingAttendance.Date,
            CheckInTime = existingAttendance.CheckInTime,
            Status = existingAttendance.Status
        });
    }

    // POST: api/attendances/check-out
    [HttpPost("check-out")]
    public IActionResult CheckOut([FromBody] CheckOutDto dto)
    {
        var today = DateTime.UtcNow.Date;
        var attendance = _context.Attendances
            .Include(a => a.Employee)
            .FirstOrDefault(a => a.EmployeeId == dto.EmployeeId && a.Date == today);

        if (attendance == null || attendance.CheckInTime == null)
        {
            return NotFound(new { message = "No check-in record found for today. Check-in first." });
        }

        if (attendance.CheckOutTime != null)
        {
            return BadRequest(new { message = "Employee has already checked out today." });
        }

        attendance.CheckOutTime = DateTime.UtcNow;
        _context.SaveChanges();

        return Ok(new AttendanceDto
        {
            Id = attendance.Id,
            EmployeeId = attendance.EmployeeId,
            EmployeeName = attendance.Employee != null ? $"{attendance.Employee.FirstName} {attendance.Employee.LastName}" : null,
            Date = attendance.Date,
            CheckInTime = attendance.CheckInTime,
            CheckOutTime = attendance.CheckOutTime,
            Status = attendance.Status
        });
    }
}