Markdown
# Full-Stack Employee Management System (EMS)

A comprehensive HR Management Portal built with **ASP.NET Core (.NET 10)** backend and **React (Vite)** frontend.

## 🚀 Live Demo & Deployment

| Component | Platform | Status / Link |
| :--- | :--- | :--- |
| **Frontend Application** | Vercel | [Live App](https://vercel.com) |
| **Backend API** | Railway | [API Service](https://railway.app) |
| **Database** | Neon Serverless | Hosted PostgreSQL |
🚀 Key Features
JWT Authentication: Secure login & logout workflow with token storage.

Employee Directory: Full CRUD operations (Add, View, Update, Delete) with live filtering/search and counter.

Attendance Management: Daily Check-In and Check-Out time recording with live status badges.

Leave Management: Leave application submissions and Admin actions (Approve / Reject).

Dashboard Overview: Summary metric cards calculating real-time counts for Employees, Today's Present, Pending Leaves, and Approved Leaves.

🛠️ Tech Stack
Backend: C# ASP.NET Core Web API, Entity Framework Core, JWT Bearer Auth, Swagger UI.

Frontend: React.js (Vite), Axios, Responsive CSS.

Database: PostgreSQL (Neon Cloud DB).

Cloud Hosting: Railway (Web API), Vercel (Client Portal).

⚙️ Environment Variables
Backend Configuration (appsettings.json)
JSON
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=ep-sample.us-east-2.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=your_password;SSL Mode=Require;"
  },
  "Jwt": {
    "Key": "your_secure_secret_key_here",
    "Issuer": "EmployeeManagementAPI",
    "Audience": "EmployeeManagementClient"
  }
}
Frontend Configuration (.env)
Code snippet
VITE_API_BASE_URL=[https://your-backend.up.railway.app](https://your-backend.up.railway.app)
🏃 Getting Started
1. Clone Repository
Bash
git clone [https://github.com/bruhtalha/EmployeeManagement.git](https://github.com/bruhtalha/EmployeeManagement.git)
cd EmployeeManagement
2. Backend Setup
Bash
cd EmployeeManagement.API
dotnet restore
dotnet run
3. Frontend Setup
Bash
cd ../employee-frontend
npm install
npm run dev
👤 Author
bruhtalha - GitHub Profile
