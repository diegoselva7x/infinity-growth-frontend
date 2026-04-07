using InfinityGrowth_UI.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace InfinityGrowth_UI.Controllers
{
    //  [Authorize(Policy = "ClienteOnly")]
    public class ClienteController : Controller
    {
        public IActionResult Portafolio()
        {
            var userId = JwtHelper.GetUserIdFromContext(HttpContext);
            var userEmail = JwtHelper.GetClaimFromContext(HttpContext, "Correo");

            if (!userId.HasValue)
            {
                return RedirectToAction("Redirect"); // o a Login
            }
                
            ViewBag.UserId = userId.Value;
            ViewBag.UserEmail = userEmail;
            return View();
        }
        public IActionResult Redirect()
        {
            return View();
        }
    }
}
