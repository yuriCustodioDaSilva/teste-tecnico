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
    public class AtendimentosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AtendimentosController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET com filtros opcionais (pacienteId, status, dataInicio, dataFim)
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

            // Se status não for informado, filtra apenas ativos
            if (string.IsNullOrWhiteSpace(status))
                query = query.Where(a => a.Status == "Ativo");
            else
                query = query.Where(a => a.Status == status);

            // Filtro por data de início
            if (!string.IsNullOrWhiteSpace(dataInicio) && DateTime.TryParse(dataInicio, out var dtInicio))
                query = query.Where(a => a.DataHora >= dtInicio);

            // Filtro por data de fim
            if (!string.IsNullOrWhiteSpace(dataFim) && DateTime.TryParse(dataFim, out var dtFim))
                query = query.Where(a => a.DataHora <= dtFim);

            return Ok(query.OrderByDescending(a => a.DataHora).ToList());
        }

        // GET por ID
        [HttpGet("{id}")]
        public ActionResult<Atendimento> GetById(int id)
        {
            var atendimento = _context.Atendimentos.Find(id);
            if (atendimento == null)
                return NotFound();

            return Ok(atendimento);
        }

        // POST - cria novo atendimento
        [HttpPost]
        public IActionResult Create([FromBody] Atendimento atendimento)
        {
            // Validação de data futura
            if (atendimento.DataHora > DateTime.Now)
                return BadRequest("Data e hora não podem ser no futuro.");

            // Garante que so exista um atendimento ativo por paciente
            var existeAtivo = _context.Atendimentos.Any(a =>
                a.PacienteId == atendimento.PacienteId &&
                a.Status == "Ativo");

            if (existeAtivo)
                return BadRequest("Já existe atendimento ativo para este paciente.");

            atendimento.Status = "Ativo";

            _context.Atendimentos.Add(atendimento);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetById), new { id = atendimento.Id }, atendimento);
        }

        // PUT - atualiza um atendimento existente
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Atendimento atendimentoAtualizado)
        {
            if (id != atendimentoAtualizado.Id)
                return BadRequest("ID do atendimento não confere.");

            var atendimentoExistente = _context.Atendimentos.Find(id);
            if (atendimentoExistente == null)
                return NotFound();

            // Validação de data futura
            if (atendimentoAtualizado.DataHora > DateTime.Now)
                return BadRequest("Data e hora não podem ser no futuro.");

            // Garante que so existe um atendimento ativo por paciente
            if (atendimentoAtualizado.Status == "Ativo")
            {
                var outroAtivo = _context.Atendimentos.Any(a =>
                    a.PacienteId == atendimentoAtualizado.PacienteId &&
                    a.Status == "Ativo" &&
                    a.Id != id);

                if (outroAtivo)
                    return BadRequest("Já existe outro atendimento ativo para este paciente.");
            }

            // Atualiza os campos permitidos
            atendimentoExistente.PacienteId = atendimentoAtualizado.PacienteId;
            atendimentoExistente.DataHora = atendimentoAtualizado.DataHora;
            atendimentoExistente.Descricao = atendimentoAtualizado.Descricao;
            atendimentoExistente.Status = atendimentoAtualizado.Status;

            _context.SaveChanges();

            return NoContent();
        }

        // PUT - inativa atendimento
        [HttpPut("{id}/inativar")]
        public IActionResult Inativar(int id)
        {
            var atendimento = _context.Atendimentos.Find(id);
            if (atendimento == null)
                return NotFound();

            atendimento.Status = "Inativo";
            _context.SaveChanges();

            return NoContent();
        }

        public class StatusUpdateDto
        {
            public string Status { get; set; }
        }

        // PUT - atualiza apenas o status
        [HttpPut("{id}/status")]
        public IActionResult AtualizarStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            if (dto.Status != "Ativo" && dto.Status != "Inativo")
                return BadRequest("Status inválido.");

            var atendimento = _context.Atendimentos.Find(id);
            if (atendimento == null)
                return NotFound();

            // Verifica duplicidade de atendimento ativo
            if (dto.Status == "Ativo")
            {
                var existeOutroAtivo = _context.Atendimentos.Any(a =>
                    a.PacienteId == atendimento.PacienteId &&
                    a.Status == "Ativo" &&
                    a.Id != id);

                if (existeOutroAtivo)
                    return BadRequest("Já existe outro atendimento ativo para este paciente.");
            }

            atendimento.Status = dto.Status;
            _context.SaveChanges();

            return NoContent();
        }

        // GET filtrar por status
        [HttpGet("filtrar")]
        public ActionResult<List<Atendimento>> GetAtendimentosFiltrados([FromQuery] string? status)
        {
            var query = _context.Atendimentos.AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(a => a.Status == status);

            var atendimentos = query.OrderByDescending(a => a.DataHora).ToList();

            return Ok(atendimentos);
        }

        // DELETE - remove atendimento
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var atendimento = _context.Atendimentos.Find(id);
            if (atendimento == null)
                return NotFound();

            _context.Atendimentos.Remove(atendimento);
            _context.SaveChanges();

            return NoContent();
        }
    }
}