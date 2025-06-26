using backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Conexão com SQLite - cria clinicaacme.db na raiz
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=clinicaacme.db"));

// Adiciona suporte ao OpenAPI/Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers();

// 👉 Adiciona política de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // origem do seu React
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configuração do Swagger no modo Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("PermitirFrontend");

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
