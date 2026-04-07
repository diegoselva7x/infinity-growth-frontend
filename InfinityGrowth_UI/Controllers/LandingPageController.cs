using Microsoft.AspNetCore.Mvc;

namespace InfinityGrowth_UI.Controllers
{
    public class LandingPageController : Controller
    {
        public IActionResult LandingPage()
        {
            return View();
        }
    }
}
