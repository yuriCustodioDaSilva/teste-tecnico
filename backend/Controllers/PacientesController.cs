using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

[ApiController]
[Route("[controller]")]
public class PacientesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PacientesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public ActionResult<List<Paciente>> GetAll(
        [FromQuery] string? nome,
        [FromQuery] string? cpf,
        [FromQuery] string? sexo,
        [FromQuery] string? dataNascimento
    )
    {
        var query = _context.Pacientes.AsQueryable();

        if (!string.IsNullOrWhiteSpace(nome))
            query = query.Where(p => p.Nome.Contains(nome));

        if (!string.IsNullOrWhiteSpace(cpf))
            query = query.Where(p => p.Cpf.Contains(cpf));

        if (!string.IsNullOrWhiteSpace(sexo))
            query = query.Where(p => p.Sexo == sexo);

        if (!string.IsNullOrWhiteSpace(dataNascimento) && DateTime.TryParse(dataNascimento, out var data))
            query = query.Where(p => p.DataNascimento.Date == data.Date);

        return Ok(query.ToList());
    }

    [HttpGet("{id}")]
    public ActionResult<Paciente> GetById(int id)
    {
        var paciente = _context.Pacientes.Find(id);
        if (paciente == null)
            return NotFound(new { message = "Paciente não encontrado." });

        return Ok(paciente);
    }

    [HttpPost]
    public ActionResult<Paciente> Create(Paciente paciente)
    {
        if (paciente.DataNascimento.Date > DateTime.Today)
            return BadRequest(new { message = "A data de nascimento não pode estar no futuro." });

        var cpfExiste = _context.Pacientes.Any(p => p.Cpf == paciente.Cpf);
        if (cpfExiste)
            return Conflict(new { message = "Já existe um paciente com esse CPF." });

        _context.Pacientes.Add(paciente);
        _context.SaveChanges();

        return CreatedAtAction(nameof(GetById), new { id = paciente.Id }, paciente);
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, Paciente pacienteAtualizado)
    {
        if (id != pacienteAtualizado.Id)
            return BadRequest(new { message = "ID do paciente não confere." });

        if (pacienteAtualizado.DataNascimento.Date > DateTime.Today)
            return BadRequest(new { message = "A data de nascimento não pode estar no futuro." });

        var pacienteExistente = _context.Pacientes.Find(id);
        if (pacienteExistente == null)
            return NotFound(new { message = "Paciente não encontrado." });

        var cpfEmUso = _context.Pacientes.Any(p => p.Cpf == pacienteAtualizado.Cpf && p.Id != id);
        if (cpfEmUso)
            return Conflict(new { message = "Já existe outro paciente com esse CPF." });

        pacienteExistente.Nome = pacienteAtualizado.Nome;
        pacienteExistente.Cpf = pacienteAtualizado.Cpf;
        pacienteExistente.Sexo = pacienteAtualizado.Sexo;
        pacienteExistente.Endereco = pacienteAtualizado.Endereco;
        pacienteExistente.DataNascimento = pacienteAtualizado.DataNascimento;
        pacienteExistente.Cep = pacienteAtualizado.Cep;
        pacienteExistente.Cidade = pacienteAtualizado.Cidade;
        pacienteExistente.Bairro = pacienteAtualizado.Bairro;
        pacienteExistente.Complemento = pacienteAtualizado.Complemento;

        _context.SaveChanges();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var paciente = _context.Pacientes.Find(id);
        if (paciente == null)
            return NotFound(new { message = "Paciente não encontrado." });

        _context.Pacientes.Remove(paciente);
        _context.SaveChanges();

        return NoContent();
    }

    [HttpGet("sem-atendimento")]
    public ActionResult<IEnumerable<Paciente>> GetPacientesSemAtendimento()
    {
        var pacientesComAtendimento = _context.Atendimentos
            .Select(a => a.PacienteId)
            .Distinct()
            .ToHashSet();

        var pacientesSemAtendimento = _context.Pacientes
            .Where(p => !pacientesComAtendimento.Contains(p.Id))
            .ToList();

        return Ok(pacientesSemAtendimento);
    }
}