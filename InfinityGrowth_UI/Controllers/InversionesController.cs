using InfinityGrowth_UI.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace InfinityGrowth_UI.Controllers
{
    public class InversionesController : Controller
    {
        public IActionResult Inversiones()
        {
            // Primero, obtener el ID de quien está logueado (desde el JWT)
            var userId = JwtHelper.GetUserIdFromContext(HttpContext);

            if (!userId.HasValue)
            {
                // Si no está logueado, redirigir a algún lugar seguro
                return RedirectToAction("Redirect"); // O podría ser al Login
            }

            int idUsuarioFinal;

            // Verificar si en la URL hay un idCliente, si sí, usamos ese
            if (Request.Query.ContainsKey("idCliente") && int.TryParse(Request.Query["idCliente"], out int idCliente))
            {
                idUsuarioFinal = idCliente;
            }
            else
            {
                idUsuarioFinal = userId.Value;
            }

            // Pasamos el ID final (cliente o usuario) al ViewBag
            ViewBag.UserId = idUsuarioFinal;

            return View();
        }
    }
}



        

