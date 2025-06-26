using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PacientesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PacientesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET /pacientes?nome=...&cpf=...&sexo=...&dataNascimento=...
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

            var pacientes = query.ToList();
            return Ok(pacientes);
        }

        // GET /pacientes/{id}
        [HttpGet("{id}")]
        public ActionResult<Paciente> GetById(int id)
        {
            var paciente = _context.Pacientes.Find(id);
            if (paciente == null)
                return NotFound();
            return Ok(paciente);
        }

        // POST /pacientes
        [HttpPost]
        public ActionResult<Paciente> Create(Paciente paciente)
        {
            // Verifica se já existe paciente com o mesmo CPF
            var cpfExiste = _context.Pacientes.Any(p => p.Cpf == paciente.Cpf);
            if (cpfExiste)
                return Conflict("Já existe um paciente com esse CPF.");

            _context.Pacientes.Add(paciente);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetById), new { id = paciente.Id }, paciente);
        }

        // PUT /pacientes/{id}
        [HttpPut("{id}")]
        public IActionResult Update(int id, Paciente pacienteAtualizado)
        {
            if (id != pacienteAtualizado.Id)
                return BadRequest("ID do paciente não confere.");

            var pacienteExistente = _context.Pacientes.Find(id);
            if (pacienteExistente == null)
                return NotFound();

            // Verifica se o novo CPF já está em uso por outro paciente
            var cpfEmUso = _context.Pacientes.Any(p => p.Cpf == pacienteAtualizado.Cpf && p.Id != id);
            if (cpfEmUso)
                return Conflict("Já existe outro paciente com esse CPF.");

            pacienteExistente.Nome = pacienteAtualizado.Nome;
            pacienteExistente.Cpf = pacienteAtualizado.Cpf;
            pacienteExistente.Sexo = pacienteAtualizado.Sexo;
            pacienteExistente.Endereco = pacienteAtualizado.Endereco;
            pacienteExistente.DataNascimento = pacienteAtualizado.DataNascimento;

            // Atualizando os campos de endereço
            pacienteExistente.Cep = pacienteAtualizado.Cep;
            pacienteExistente.Cidade = pacienteAtualizado.Cidade;
            pacienteExistente.Bairro = pacienteAtualizado.Bairro;
            pacienteExistente.Complemento = pacienteAtualizado.Complemento;

            _context.SaveChanges();

            return NoContent();
        }

        // DELETE /pacientes/{id}
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var paciente = _context.Pacientes.Find(id);
            if (paciente == null)
                return NotFound();

            _context.Pacientes.Remove(paciente);
            _context.SaveChanges();

            return NoContent();
        }
    }
}
