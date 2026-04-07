using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfinityGrowth_UI.Controllers
{
    [Authorize(Policy = "AdminOnly")]
    public class AdminController : Controller
    {
        public IActionResult Comisiones()
        {
            return View();
        }

        public IActionResult GestionUsuarios()
        {
            return View();
        }

    }

 
}
