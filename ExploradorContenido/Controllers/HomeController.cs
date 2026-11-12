using System.Diagnostics;
using ExploradorContenido.Models;
using Microsoft.AspNetCore.Mvc;

namespace ExploradorContenido.Controllers
{
    public class HomeController : Controller
    {
        // La vista solo entrega la estructura de las cuatro tarjetas.
        // El contenido se obtiene desde el navegador con fetch (wwwroot/js/explorador.js).
        public IActionResult Index()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
