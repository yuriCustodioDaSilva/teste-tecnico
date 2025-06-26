using backend.Models;

namespace backend.Models.Dtos
{
    public class AtendimentoComPacienteDto
    {
        public Paciente Paciente { get; set; }
        public Atendimento Atendimento { get; set; }
    }
}
