namespace backend.Models
{
    public class Paciente
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public DateTime DataNascimento { get; set; }
        public string Cpf { get; set; }
        public string Sexo { get; set; }
        public string Endereco { get; set; }
        public string Status { get; set; }
    }
}
