using System;
using System.Linq;
using EmployeeManagement.Domain.DTOs.Employee;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public EmployeesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/employees
    [HttpGet]
    public IActionResult GetEmployees()
    {
        var employees = _context.Employees
            .Include(e => e.Department)
            .Select(e => new EmployeeDto
            {
                Id = e.Id,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Email = e.Email,
                Phone = e.Phone,
                HireDate = e.HireDate,
                Salary = e.Salary,
                DepartmentId = e.DepartmentId,
                DepartmentName = e.Department != null ? e.Department.Name : null
            })
            .ToList();

        return Ok(employees);
    }

    // GET: api/employees/1
    [HttpGet("{id}")]
    public IActionResult GetEmployeeById(int id)
    {
        var employee = _context.Employees
            .Include(e => e.Department)
            .FirstOrDefault(e => e.Id == id);

        if (employee == null)
        {
            return NotFound(new { message = $"Employee with ID {id} not found." });
        }

        var dto = new EmployeeDto
        {
            Id = employee.Id,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            Email = employee.Email,
            Phone = employee.Phone,
            HireDate = employee.HireDate,
            Salary = employee.Salary,
            DepartmentId = employee.DepartmentId,
            DepartmentName = employee.Department != null ? employee.Department.Name : null
        };

        return Ok(dto);
    }

    // POST: api/employees
    [HttpPost]
    public IActionResult CreateEmployee([FromBody] CreateEmployeeDto createDto, [FromQuery] string? departmentName = null)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        int targetDepartmentId = createDto.DepartmentId;

        if (!string.IsNullOrWhiteSpace(departmentName))
        {
            var existingDept = _context.Departments
                .FirstOrDefault(d => d.Name.ToLower() == departmentName.Trim().ToLower());

            if (existingDept != null)
            {
                targetDepartmentId = existingDept.Id;
            }
            else
            {
                var newDept = new Department { Name = departmentName.Trim() };
                _context.Departments.Add(newDept);
                _context.SaveChanges();
                targetDepartmentId = newDept.Id;
            }
        }
        else
        {
            var deptExists = _context.Departments.Any(d => d.Id == targetDepartmentId);
            if (!deptExists)
            {
                var fallbackDept = _context.Departments.FirstOrDefault();
                if (fallbackDept != null)
                {
                    targetDepartmentId = fallbackDept.Id;
                }
                else
                {
                    var newDept = new Department { Name = "General" };
                    _context.Departments.Add(newDept);
                    _context.SaveChanges();
                    targetDepartmentId = newDept.Id;
                }
            }
        }

        var employee = new Employee
        {
            FirstName = string.IsNullOrWhiteSpace(createDto.FirstName) ? "Unknown" : createDto.FirstName,
            LastName = string.IsNullOrWhiteSpace(createDto.LastName) ? "-" : createDto.LastName,
            Email = string.IsNullOrWhiteSpace(createDto.Email) ? $"{Guid.NewGuid().ToString().Substring(0, 8)}@example.com" : createDto.Email,
            Phone = createDto.Phone ?? "0300-0000000",
            HireDate = createDto.HireDate == default ? DateTime.UtcNow : createDto.HireDate,
            Salary = createDto.Salary > 0 ? createDto.Salary : 50000,
            DepartmentId = targetDepartmentId
        };

        _context.Employees.Add(employee);
        _context.SaveChanges();

        var createdDept = _context.Departments.Find(targetDepartmentId);

        var responseDto = new EmployeeDto
        {
            Id = employee.Id,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            Email = employee.Email,
            Phone = employee.Phone,
            HireDate = employee.HireDate,
            Salary = employee.Salary,
            DepartmentId = employee.DepartmentId,
            DepartmentName = createdDept != null ? createdDept.Name : null
        };

        return CreatedAtAction(nameof(GetEmployeeById), new { id = employee.Id }, responseDto);
    }

    // PUT: api/employees/1
    [HttpPut("{id}")]
    public IActionResult UpdateEmployee(int id, [FromBody] UpdateEmployeeDto updateDto, [FromQuery] string? departmentName = null)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var employee = _context.Employees.Find(id);
        if (employee == null)
        {
            return NotFound(new { message = $"Employee with ID {id} not found." });
        }

        int targetDepartmentId = updateDto.DepartmentId;

        if (!string.IsNullOrWhiteSpace(departmentName))
        {
            var existingDept = _context.Departments
                .FirstOrDefault(d => d.Name.ToLower() == departmentName.Trim().ToLower());

            if (existingDept != null)
            {
                targetDepartmentId = existingDept.Id;
            }
            else
            {
                var newDept = new Department { Name = departmentName.Trim() };
                _context.Departments.Add(newDept);
                _context.SaveChanges();
                targetDepartmentId = newDept.Id;
            }
        }
        else
        {
            var departmentExists = _context.Departments.Any(d => d.Id == updateDto.DepartmentId);
            if (!departmentExists)
            {
                var fallbackDept = _context.Departments.FirstOrDefault();
                if (fallbackDept != null)
                {
                    targetDepartmentId = fallbackDept.Id;
                }
                else
                {
                    var newDept = new Department { Name = "General" };
                    _context.Departments.Add(newDept);
                    _context.SaveChanges();
                    targetDepartmentId = newDept.Id;
                }
            }
        }

        employee.FirstName = updateDto.FirstName;
        employee.LastName = updateDto.LastName;
        employee.Phone = updateDto.Phone;
        employee.Salary = updateDto.Salary;
        employee.DepartmentId = targetDepartmentId;

        _context.SaveChanges();

        return NoContent();
    }

    // DELETE: api/employees/1
    [HttpDelete("{id}")]
    public IActionResult DeleteEmployee(int id)
    {
        var employee = _context.Employees.Find(id);
        if (employee == null)
        {
            return NotFound(new { message = $"Employee with ID {id} not found." });
        }

        _context.Employees.Remove(employee);
        _context.SaveChanges();

        return NoContent();
    }
}