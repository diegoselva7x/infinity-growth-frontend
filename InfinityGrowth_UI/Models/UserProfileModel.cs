using Microsoft.AspNetCore.Mvc.RazorPages;

namespace InfinityGrowth_UI.Models
{
    public class UserProfileModel
    {
        public int Id { get; set; }
        public string? Correo { get; set; }
        public string? Nombre { get; set; }
        public string? Apellido1 { get; set; }
        public string? Apellido2 { get; set; }
        public string? TipoUsuario { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public string? FotoBase64 { get; set; }
    }

    public class ImagenResponse
    {
        public string? ImageData { get; set; }
    }
}
