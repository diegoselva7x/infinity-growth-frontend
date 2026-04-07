using System.ComponentModel.DataAnnotations.Schema;

namespace InfinityGrowth_UI.Models
{
    public class Usuarios
    {
        public int Id { get; set; }
        public string Correo { get; set; }
        public string Password { get; set; }
        public string Nombre { get; set; }
        public string Apellido1 { get; set; }
        public string Apellido2 { get; set; }
        public int TipoUsuario { get; set; }
        public int Estado { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public string Direccion { get; set; }
        public byte[] ProfileFoto { get; set; }
        public bool isPasswordTemp { get; set; }

        [NotMapped]
        public int IdAsesor { get; set; }

    }
}