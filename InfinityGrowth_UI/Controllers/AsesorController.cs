using InfinityGrowth_UI.Helpers;
using InfinityGrowth_UI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Text;

namespace InfinityGrowth_UI.Controllers
{
    //[Authorize(Policy = "AsesorOnly")]
    public class AsesorController : Controller
    {
        private readonly string _baseUrl;

        public AsesorController(IConfiguration configuration)
        {
            _baseUrl = configuration.GetValue<string>("ApiSettings:BaseUrl");
        }

        public IActionResult RegistroCliente()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RegistroCliente(UsuariosViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            // Convertir IFormFile (foto) a byte[]
            byte[] fotoBytes;
            using (var memoryStream = new MemoryStream())
            {
                await model.Foto.CopyToAsync(memoryStream);
                fotoBytes = memoryStream.ToArray();
            }

            var idAsesor = JwtHelper.GetUserIdFromContext(HttpContext);
            if (idAsesor == null)
            {
                ModelState.AddModelError(string.Empty, "Sesión inválida. Vuelva a iniciar sesión.");
                return View(model);
            }

            var nuevoUsuario = new Usuarios
            {
                Nombre = model.Nombre,
                Apellido1 = model.Apellido1,
                Apellido2 = model.Apellido2,
                Correo = model.Correo,
                Direccion = model.Direccion,
                FechaNacimiento = model.FechaNacimiento ?? DateTime.MinValue,
                ProfileFoto = fotoBytes,
                Password = "Temporal123+",
                isPasswordTemp = true,
                TipoUsuario = 3,
                Estado = 1,
                IdAsesor = idAsesor.Value
            };

            // Convertir el objeto a JSON
            using (HttpClient client = new HttpClient())
            {
                var content = new StringContent(JsonConvert.SerializeObject(nuevoUsuario), Encoding.UTF8, "application/json");
                var response = await client.PostAsync(_baseUrl + "/api/Registrarse/CreateUser", content);
                if (response.IsSuccessStatusCode)
                {
                    var jsonString = await response.Content.ReadAsStringAsync();
                    var apiResponse = JsonConvert.DeserializeObject<API_Response>(jsonString);
                    if (apiResponse.Result == "OK")
                    {
                        TempData["SuccessMessage"] = apiResponse.Message;
                        return RedirectToAction("RegistroCliente");
                    }
                    else
                    {
                        ModelState.AddModelError(string.Empty, apiResponse.Message);
                        TempData["ErrorMessage"] = apiResponse.Message;
                        return View(model);
                    }
                }
                else
                {
                    var errorMessage = "Error al registrar el cliente.";
                    ModelState.AddModelError(string.Empty, errorMessage);
                    TempData["ErrorMessage"] = errorMessage;
                    return View(model);
                }
            }
        }
    }
}
