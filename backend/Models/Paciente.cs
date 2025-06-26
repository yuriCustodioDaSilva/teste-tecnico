namespace backend.Models
{
    public class Paciente
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public DateTime DataNascimento { get; set; }
        public string Cpf { get; set; } = string.Empty;
        public string Sexo { get; set; } = string.Empty;
        public string? Cep { get; set; }
        public string? Cidade { get; set; }
        public string? Bairro { get; set; }
        public string? Endereco { get; set; }
        public string? Complemento { get; set; }
    }
}