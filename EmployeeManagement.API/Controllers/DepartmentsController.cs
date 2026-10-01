using EmployeeManagement.Domain.DTOs.Department;
using EmployeeManagement.Domain.Entities;
using EmployeeManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagement.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DepartmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DepartmentsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/departments
    [HttpGet]
    public IActionResult GetDepartments()
    {
        var departments = _context.Departments
            .Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Description = d.Description
            })
            .ToList();

        return Ok(departments);
    }

    // GET: api/departments/1
    [HttpGet("{id}")]
    public IActionResult GetDepartmentById(int id)
    {
        var department = _context.Departments.Find(id);
        if (department == null)
        {
            return NotFound(new { message = $"Department with ID {id} not found." });
        }

        var dto = new DepartmentDto
        {
            Id = department.Id,
            Name = department.Name,
            Description = department.Description
        };

        return Ok(dto);
    }

    // POST: api/departments
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public IActionResult CreateDepartment([FromBody] CreateDepartmentDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var department = new Department
        {
            Name = createDto.Name,
            Description = createDto.Description
        };

        _context.Departments.Add(department);
        _context.SaveChanges();

        var responseDto = new DepartmentDto
        {
            Id = department.Id,
            Name = department.Name,
            Description = department.Description
        };

        return CreatedAtAction(nameof(GetDepartmentById), new { id = department.Id }, responseDto);
    }

    // PUT: api/departments/1
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public IActionResult UpdateDepartment(int id, [FromBody] UpdateDepartmentDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var department = _context.Departments.Find(id);
        if (department == null)
        {
            return NotFound(new { message = $"Department with ID {id} not found." });
        }

        department.Name = updateDto.Name;
        department.Description = updateDto.Description;

        _context.SaveChanges();

        return NoContent();
    }

    // DELETE: api/departments/1
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public IActionResult DeleteDepartment(int id)
    {
        var department = _context.Departments.Find(id);
        if (department == null)
        {
            return NotFound(new { message = $"Department with ID {id} not found." });
        }

        _context.Departments.Remove(department);
        _context.SaveChanges();

        return NoContent();
    }
}