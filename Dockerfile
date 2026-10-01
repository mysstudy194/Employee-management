FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy csproj files and restore
COPY EmployeeManagement.Domain/EmployeeManagement.Domain.csproj EmployeeManagement.Domain/
COPY EmployeeManagement.Infrastructure/EmployeeManagement.Infrastructure.csproj EmployeeManagement.Infrastructure/
COPY EmployeeManagement.API/EmployeeManagement.API.csproj EmployeeManagement.API/
RUN dotnet restore EmployeeManagement.API/EmployeeManagement.API.csproj

# Copy everything else and build
COPY . .
WORKDIR /app/EmployeeManagement.API
RUN dotnet publish -c Release -o /out

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /out .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "EmployeeManagement.API.dll"]
