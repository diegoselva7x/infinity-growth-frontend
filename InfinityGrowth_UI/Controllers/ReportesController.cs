using InfinityGrowth_UI.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace InfinityGrowth_UI.Controllers
{
    public class ReportesController : Controller
    {
        public IActionResult ReporteTransacciones()
        {
            return View();
        }
        public IActionResult ReporteAdmin()
        {
            var usuario = JwtHelper.GetUserIdFromContext(HttpContext);
            return View(usuario);
        }
        public IActionResult ReporteAsesor()
        {
            var usuario = JwtHelper.GetUserIdFromContext(HttpContext);
            return View(usuario);
        }
        public IActionResult ReporteCliente()
        {
            var usuario = JwtHelper.GetUserIdFromContext(HttpContext);
            return View(usuario);
        }
    }
}
