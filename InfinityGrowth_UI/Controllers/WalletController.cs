using InfinityGrowth_UI.Helpers;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace InfinityGrowth_UI.Controllers
{
    public class WalletController : Controller
    {
        private readonly string _paypalBaseUrl = "https://localhost:44378/api/PayPal/";
        private readonly string _walletBaseUrl = "https://localhost:44378/api/Wallet/";

        public ActionResult Wallet()
        {
            return View();
        }

        public class OrderRequest
        {
            public string OrderId { get; set; }
            public decimal Monto { get; set; }
        }
        [HttpPost]
        public async Task<IActionResult> CrearOrden([FromBody] JsonElement data)
        {
            var httpClient = new HttpClient();

            // Construcción segura del cuerpo como JSON string
            var rawJson = data.GetRawText();
            var contenido = new StringContent(rawJson, Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync(_paypalBaseUrl + "create-order", contenido);

            if (!response.IsSuccessStatusCode)
            {
                var errorText = await response.Content.ReadAsStringAsync();
                return BadRequest(new { success = false, message = errorText });
            }

            var plainResponse = await response.Content.ReadAsStringAsync();

            // Retornar texto plano como texto
            return Content(plainResponse, "text/plain");
        }

        [HttpPost]
        public async Task<IActionResult> CapturarOrden([FromBody] OrderRequest request)
        {
            var orderId = request.OrderId;
            var httpClient = new HttpClient();
            var contenido = new StringContent($"{{\"orderId\":\"{orderId}\"}}", Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync(_paypalBaseUrl + "capture-order", contenido);

            if (!response.IsSuccessStatusCode)
                return BadRequest("Error al capturar el pago");

            var data = await response.Content.ReadAsStringAsync();

            // ✅ Obtener userId desde la sesión
            var userId = JwtHelper.GetUserIdFromContext(HttpContext);
            if (!userId.HasValue)
            {
                return RedirectToAction("Redirect"); // o a Login
            }

            ViewBag.UserId = userId.Value; // o Login si no hay sesión válida

            // ✅ Obtener monto desde el request (si lo tienes que mandar desde frontend)
            var monto = request.Monto; // Asegúrate que `Monto` exista en tu modelo OrderRequest

            // ✅ Crear payload del depósito
            var deposito = new
            {
                idUsuario = userId,
                monto = monto,
                tipoFondo = true,
                concepto = "" // se puede ignorar si tu backend no lo requiere
            };

            var json = JsonConvert.SerializeObject(deposito);
            var depositoContent = new StringContent(json, Encoding.UTF8, "application/json");

            var depositoResponse = await httpClient.PostAsync(_walletBaseUrl + "deposit", depositoContent);

            if (!depositoResponse.IsSuccessStatusCode)
                return BadRequest("El pago se capturó, pero hubo un error al registrar en el wallet");

            var balanceResponse = await httpClient.GetAsync($"{_walletBaseUrl}balance/{userId}");
            if (!balanceResponse.IsSuccessStatusCode)
                return BadRequest("Pago registrado pero error al consultar balance");

            var balanceData = await balanceResponse.Content.ReadAsStringAsync();

            return Content(data, "application/json");
        }

    }
}
