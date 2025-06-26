using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
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

        // GET /pacientes
        [HttpGet]
        public ActionResult<List<Paciente>> GetAll()
        {
            var pacientes = _context.Pacientes.ToList();
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

            pacienteExistente.Nome = pacienteAtualizado.Nome;
            pacienteExistente.Cpf = pacienteAtualizado.Cpf;

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
