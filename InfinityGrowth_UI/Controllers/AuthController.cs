using System.Net.Http.Headers;
using InfinityGrowth_UI.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Text;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace InfinityGrowth_UI.Controllers
{
    public class AuthController : Controller
    {
        private readonly string _baseUrl;

        public AuthController(IConfiguration configuration)
        {
            _baseUrl = configuration.GetValue<string>("ApiSettings:BaseUrl");
        }

        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (!ModelState.IsValid) return View(model);

            using (HttpClient client = new HttpClient())
            {
                var content = new StringContent(JsonConvert.SerializeObject(model), Encoding.UTF8, "application/json");
                var response = await client.PostAsync(_baseUrl + "/api/Auth/Login", content);

                if (response.IsSuccessStatusCode)
                {
                    var jsonString = await response.Content.ReadAsStringAsync();
                    var apiResponse = JsonConvert.DeserializeObject<API_Response>(jsonString);

                    if (apiResponse.Result == "OK")
                    {
                        if (apiResponse.Data.ToString().Contains("isTemp"))
                        {
                            dynamic tempData = JsonConvert.DeserializeObject<dynamic>(apiResponse.Data.ToString());
                            int userId = tempData.id;

                            TempData["ShowPasswordAlert"] = "Debe cambiar su contraseña para continuar.";
                            return RedirectToAction("CambiarContrasena", "Auth");
                        }
                        else
                        {
                            TempData["UserId"] = apiResponse.Data;
                            ViewBag.ShowOTPModal = true;
                            ViewBag.Message = apiResponse.Message;
                        }
                        return View(model);
                    }
                    else
                    {
                        ViewBag.LoginError = apiResponse.Message;
                        return View(model);
                    }
                }
                ViewBag.Error = "Ocurrió un error inesperado.";
                return View(model);
            }
        }

        [HttpPost]
        public async Task<IActionResult> ValidatetOTP(int userId, int otpCode)
        {
            using (HttpClient client = new HttpClient())
            {
                var otpRequest = new
                {
                    Id_Usuario = userId,
                    Otp_Code = otpCode
                };

                var content = new StringContent(JsonConvert.SerializeObject(otpRequest), Encoding.UTF8, "application/json");
                var response = await client.PostAsync(_baseUrl + "/api/Auth/ValidateOTP", content);

                if (response.IsSuccessStatusCode)
                {
                    var jsonString = await response.Content.ReadAsStringAsync();
                    var apiResponse = JsonConvert.DeserializeObject<API_Response>(jsonString);

                    if (apiResponse.Result == "OK")
                    {
                        // Extraer token desde la propiedad Data
                        dynamic tempData = JsonConvert.DeserializeObject<dynamic>(apiResponse.Data.ToString());
                        string token = tempData.token;

                        var handler = new JwtSecurityTokenHandler();
                        var jwtToken = handler.ReadJwtToken(token);

                        var claims = jwtToken.Claims.ToList();

                        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                        var principal = new ClaimsPrincipal(identity);

                        await HttpContext.SignInAsync("MyCookieAuth", principal,
                            new AuthenticationProperties
                            {
                                IsPersistent = true,
                                ExpiresUtc = DateTime.UtcNow.AddMinutes(40)
                            });

                        return RedirectToAction("Inversiones", "Inversiones");
                    }

                    ViewBag.OTPError = apiResponse.Message;
                    ViewBag.ShowOTPModal = true;
                    TempData["UserId"] = userId;
                    return View("Login");
                }

                ViewBag.OTPError = "Ocurrió un error al validar el OTP.";
                ViewBag.ShowOTPModal = true;
                TempData["UserId"] = userId;
                return View("Login");
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();

            Response.Cookies.Delete("InfinityGrowth.Auth");

            return RedirectToAction("Index", "Home");
        }

        public async Task<IActionResult> UserProfile()
        {
            //get claims from cookie
            var claims = HttpContext.User.Claims.ToList();

            var correo = claims.FirstOrDefault(c => c.Type == "Correo")?.Value;
            var userId = claims.FirstOrDefault(c => c.Type == "UserId")?.Value;
            var nombre = claims.FirstOrDefault(c => c.Type == "Nombre")?.Value;
            var Apellido1 = claims.FirstOrDefault(c => c.Type == "Apellido1")?.Value;
            var Apellido2 = claims.FirstOrDefault(c => c.Type == "Apellido2")?.Value;
            var tipoUsuario = claims.FirstOrDefault(c => c.Type == "TipoUsuario")?.Value;
            var fechaNacimiento = claims.FirstOrDefault(c => c.Type == "FechaNacimiento")?.Value;

            string? fotoBase64 = null;

            using (var httpClient = new HttpClient())
            {
                string apiUrl = _baseUrl + $"/api/Auth/GetProfilePicture/{userId}";
                var response = await httpClient.GetAsync(apiUrl);

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<ImagenResponse>();
                    fotoBase64 = result?.ImageData;
                }
            }


            if (tipoUsuario == "1")
            {
                ViewBag.TipoUsuario = "Administrador";
            }
            else if (tipoUsuario == "2")
            {
                ViewBag.TipoUsuario = "Asesor";
            }
            else if (tipoUsuario == "3")
            {
                ViewBag.TipoUsuario = "Cliente";
            }

            var model = new UserProfileModel
            {
                Id = int.Parse(userId),
                Correo = correo,
                Nombre = nombre,
                Apellido1 = Apellido1,
                Apellido2 = Apellido2,
                TipoUsuario = ViewBag.TipoUsuario,
                FechaNacimiento = DateTime.Parse(fechaNacimiento),
                FotoBase64 = fotoBase64
            };

            return View(model);
        }

        public IActionResult AccessDenied()
        {
            return View();
        }

        public ActionResult CambiarContrasena()
        {
            return View();
        }
    }

}
