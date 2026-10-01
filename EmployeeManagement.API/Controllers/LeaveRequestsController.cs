using EmployeeManagement.Domain.DTOs.LeaveRequest;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaveRequestsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public LeaveRequestsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/leaverequests
    [HttpGet]
    public IActionResult GetAllLeaveRequests()
    {
        var requests = _context.LeaveRequests
            .Include(l => l.Employee)
            .OrderByDescending(l => l.RequestedAt)
            .Select(l => new LeaveRequestDto
            {
                Id = l.Id,
                EmployeeId = l.EmployeeId,
                EmployeeName = l.Employee != null ? $"{l.Employee.FirstName} {l.Employee.LastName}" : null,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                Reason = l.Reason,
                Status = l.Status,
                RequestedAt = l.RequestedAt
            })
            .ToList();

        return Ok(requests);
    }

    // GET: api/leaverequests/employee/1
    [HttpGet("employee/{employeeId}")]
    public IActionResult GetLeaveRequestsByEmployee(int employeeId)
    {
        var requests = _context.LeaveRequests
            .Where(l => l.EmployeeId == employeeId)
            .OrderByDescending(l => l.RequestedAt)
            .Select(l => new LeaveRequestDto
            {
                Id = l.Id,
                EmployeeId = l.EmployeeId,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                Reason = l.Reason,
                Status = l.Status,
                RequestedAt = l.RequestedAt
            })
            .ToList();

        return Ok(requests);
    }

    // POST: api/leaverequests
    [HttpPost]
    public IActionResult CreateLeaveRequest([FromBody] CreateLeaveRequestDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (dto.EndDate < dto.StartDate)
        {
            return BadRequest(new { message = "EndDate cannot be earlier than StartDate." });
        }

        var employeeExists = _context.Employees.Any(e => e.Id == dto.EmployeeId);
        if (!employeeExists)
        {
            return NotFound(new { message = $"Employee with ID {dto.EmployeeId} not found." });
        }

        var leaveRequest = new LeaveRequest
        {
            EmployeeId = dto.EmployeeId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Reason = dto.Reason,
            Status = "Pending",
            RequestedAt = DateTime.UtcNow
        };

        _context.LeaveRequests.Add(leaveRequest);
        _context.SaveChanges();

        return Ok(new { message = "Leave request submitted successfully.", requestId = leaveRequest.Id });
    }

    // PUT: api/leaverequests/1/status
    [HttpPut("{id}/status")]
    public IActionResult UpdateLeaveStatus(int id, [FromBody] UpdateLeaveStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var leaveRequest = _context.LeaveRequests.Find(id);
        if (leaveRequest == null)
        {
            return NotFound(new { message = $"Leave request with ID {id} not found." });
        }

        leaveRequest.Status = dto.Status;
        _context.SaveChanges();

        return Ok(new { message = $"Leave request has been {dto.Status.ToLower()}." });
    }
}