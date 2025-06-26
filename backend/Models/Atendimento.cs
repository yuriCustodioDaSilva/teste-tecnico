namespace backend.Models
{
    public class Atendimento
    {
        public int Id { get; set; }

        public int PacienteId { get; set; }

        public DateTime DataHora { get; set; }

        public string Descricao { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
    }
}
