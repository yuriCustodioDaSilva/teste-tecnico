using backend.Data;
using backend.Models;
using backend.Models.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AtendimentosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AtendimentosController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<List<Atendimento>> GetAll(
            [FromQuery] int? pacienteId,
            [FromQuery] string? status,
            [FromQuery] string? dataInicio,
            [FromQuery] string? dataFim)
        {
            var query = _context.Atendimentos.AsQueryable();

            if (pacienteId.HasValue)
                query = query.Where(a => a.PacienteId == pacienteId.Value);


            if (string.IsNullOrWhiteSpace(status))
                query = query.Where(a => a.Status == "Ativo");
            else
                query = query.Where(a => a.Status == status);

            if (!string.IsNullOrWhiteSpace(dataInicio) && DateTime.TryParse(dataInicio, out var dtInicio))
                query = query.Where(a => a.DataHora >= dtInicio);

            if (!string.IsNullOrWhiteSpace(dataFim) && DateTime.TryParse(dataFim, out var dtFim))
                query = query.Where(a => a.DataHora <= dtFim);

            var atendimentos = query.ToList();
            return Ok(atendimentos);
        }

        [HttpGet("{id}")]
        public ActionResult<Atendimento> GetById(int id)
        {
            var atendimento = _context.Atendimentos.FirstOrDefault(a => a.Id == id);

            if (atendimento == null)
                return NotFound();

            return Ok(atendimento);
        }

        [HttpPost]
        public ActionResult<Atendimento> Create(Atendimento atendimento)
        {
            var paciente = _context.Pacientes.Find(atendimento.PacienteId);
            if (paciente == null)
                return BadRequest("Paciente não encontrado.");

            if (atendimento.DataHora > DateTime.Now)
                return BadRequest("A data e hora do atendimento não pode ser no futuro.");

            if (string.IsNullOrWhiteSpace(atendimento.Descricao))
                return BadRequest("Descrição é obrigatória.");


            if (string.IsNullOrWhiteSpace(atendimento.Status))
                atendimento.Status = "Ativo";

            _context.Atendimentos.Add(atendimento);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetById), new { id = atendimento.Id }, atendimento);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Paciente pacienteAtualizado)
        {
            if (id != pacienteAtualizado.Id)
                return BadRequest("ID do paciente não confere.");

            var pacienteExistente = _context.Pacientes.Find(id);
            if (pacienteExistente == null)
                return NotFound();


            pacienteExistente.Nome = pacienteAtualizado.Nome;
            pacienteExistente.Cpf = pacienteAtualizado.Cpf;
            pacienteExistente.Sexo = pacienteAtualizado.Sexo;
            pacienteExistente.Cep = pacienteAtualizado.Cep;
            pacienteExistente.Endereco = pacienteAtualizado.Endereco;
            pacienteExistente.Bairro = pacienteAtualizado.Bairro;
            pacienteExistente.Cidade = pacienteAtualizado.Cidade;
            pacienteExistente.Complemento = pacienteAtualizado.Complemento;

            _context.SaveChanges();

            return NoContent();
        }


        [HttpDelete("{id}")]
        public IActionResult Inactivate(int id)
        {
            var atendimento = _context.Atendimentos.Find(id);
            if (atendimento == null)
                return NotFound();

            atendimento.Status = "Inativo";
            _context.SaveChanges();

            return NoContent();
        }


        [HttpDelete("{id}/excluir")]
        public IActionResult Delete(int id)
        {
            var atendimento = _context.Atendimentos.Find(id);
            if (atendimento == null)
                return NotFound();

            _context.Atendimentos.Remove(atendimento);
            _context.SaveChanges();

            return NoContent();
        }

        [HttpPost("completo")]
        public ActionResult CreateAtendimentoComPaciente(AtendimentoComPacienteDto dto)
        {
            if (_context.Pacientes.Any(p => p.Cpf == dto.Paciente.Cpf))
                return Conflict("Paciente com este CPF já existe.");

            _context.Pacientes.Add(dto.Paciente);
            _context.SaveChanges();

            dto.Atendimento.PacienteId = dto.Paciente.Id;

            if (dto.Atendimento.DataHora > DateTime.Now)
                return BadRequest("DataHora do atendimento não pode ser no futuro.");

            if (string.IsNullOrWhiteSpace(dto.Atendimento.Descricao))
                return BadRequest("Descrição do atendimento é obrigatória.");

            if (string.IsNullOrWhiteSpace(dto.Atendimento.Status))
                dto.Atendimento.Status = "Ativo";

            _context.Atendimentos.Add(dto.Atendimento);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetById), new { id = dto.Atendimento.Id }, dto.Atendimento);
        }
    }
}
