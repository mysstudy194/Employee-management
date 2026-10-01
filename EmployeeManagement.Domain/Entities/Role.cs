namespace EmployeeManagement.Domain.Entities;

public class Role
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public System.Collections.Generic.ICollection<User> Users { get; set; }
        = new System.Collections.Generic.List<User>();
}