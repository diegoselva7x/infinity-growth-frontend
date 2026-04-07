let chart = null;
let precioActual = 0;
let simboloActual = "AAPL";
let rangoActual = "1day";
let porcentajeComision = 0;

$(document).ready(function () {
    console.log(" inversiones.js cargado correctamente.");
    cargarDatosStock(simboloActual, rangoActual);
    cargarComisionPlataforma();

    $(".stock-card").on("click", function () {
        const symbol = $(this).data("symbol");
        simboloActual = symbol;
        console.log(" Cargando datos de:", symbol);
        cargarDatosStock(symbol, rangoActual);
    });

    $(".rango-btn").on("click", function () {
        $(".rango-btn").removeClass("bg-[var(--bg-color)] rounded");
        $(this).addClass("bg-[var(--bg-color)] rounded");

        rangoActual = $(this).data("range");
        console.log(" Cambiando rango a:", rangoActual);
        cargarDatosStock(simboloActual, rangoActual);
    });

    $("#cantidadInput").on("input", actualizarCalculos);

    cargarSugerencia();
});


function cargarDatosStock(symbol, range = "1day") {
    $.ajax({
        url: API_URL_BASE + `/api/Stock/${symbol}?range=${range}`,
        type: "GET",
        success: function (data) {
            console.log(" Datos recibidos:", data);

            if (!data || !data.meta || !data.values || data.values.length === 0) {
                alert("No hay datos disponibles para este rango.");
                return;
            }

            const companyName = `${data.meta.symbol} - ${data.meta.type || ''}`;
            const lastCandle = data.values[0];
            const lastClose = parseFloat(lastCandle.close);
            const lastOpen = parseFloat(lastCandle.open);

            const variacion = lastClose - lastOpen;
            const variacionPorcentaje = ((variacion / lastOpen) * 100).toFixed(2);
            const esGanancia = variacion >= 0;

            precioActual = lastClose;
            $("#nombreAccion").text(companyName);
            $("#precioActual").text(`$${lastClose.toFixed(2)}`);

            const textoVariacion = `${esGanancia ? '+' : ''}$${variacion.toFixed(2)} (${esGanancia ? '+' : ''}${variacionPorcentaje}%) Precio al cierre del mercado`;
            $("#variacion")
                .text(textoVariacion)
                .css("color", `var(--${esGanancia ? 'positive' : 'negative'}-color)`);

            // Actualizar tarjeta
            const tarjeta = $(`.stock-card[data-symbol="${data.meta.symbol}"]`);
            tarjeta.find("p.text-sm").text(`$${lastClose.toFixed(2)}`);
            tarjeta.find("p.font-semibold").last()
                .text(`${esGanancia ? '+' : ''}${variacionPorcentaje}%`)
                .css("color", `var(--${esGanancia ? 'positive' : 'negative'}-color)`);

            actualizarCalculos();

            setTimeout(() => {
                renderizarGraficoLinea(data.values.reverse());
            }, 50);
        },
        error: function (xhr) {
            const mensaje = xhr.responseJSON?.message || "Error al obtener datos del mercado.";
            console.error(" Error AJAX:", xhr);
            alert(mensaje);
        },
    });
}

function cargarComisionPlataforma() {
    $.ajax({
        url: API_URL_BASE + '/api/AjusteComisiones',
        method: 'GET',
        success: function (response) {
            if (response.result === 'OK' && Array.isArray(response.data)) {
                const tipo1 = response.data.find(item => item.idTipoComision === 1);
                if (tipo1) {
                    porcentajeComision = parseFloat(tipo1.porcentaje);
                    $("#comision").text(tipo1.porcentaje + "%");
                    actualizarCalculos();
                } else {
                    $("#comision").text("N/A");
                }
            } else {
                $("#comision").text("Error en datos");
            }
        },
        error: function () {
            $("#comision").text("Error al cargar");
        }
    });
}

function actualizarCalculos() {
    const cantidad = parseFloat($("#cantidadInput").val());

    if (isNaN(cantidad) || cantidad <= 0 || isNaN(precioActual)) {
        $("#precioEstimado").text("$0.00");
        $("#montoEstimado").text("$0.00");
        $("#total").text("$0.00");
        return;
    }

    const montoEstimado = precioActual * cantidad;
    const comision = (montoEstimado * porcentajeComision) / 100;
    const total = montoEstimado + comision;

    $("#precioEstimado").text(`$${(precioActual * cantidad).toFixed(2)}`);
    $("#montoEstimado").text(`$${montoEstimado.toFixed(2)}`);
    $("#total").text(`$${total.toFixed(2)}`);
}

function renderizarGraficoLinea(values) {
    const canvas = document.getElementById("graficoAccion");
    if (!canvas) {
        console.warn(" No se encontró el canvas con ID 'graficoAccion'");
        return;
    }

    console.log(" Canvas encontrado, dibujando gráfico...");

    const ctx = canvas.getContext("2d");

    const labels = values.map(d => d.datetime);
    const datosCierre = values.map(d => parseFloat(d.close));
    const datosApertura = values.map(d => parseFloat(d.open));

    const ultimoCierre = datosCierre[datosCierre.length - 1];
    const ultimoOpen = datosApertura[datosApertura.length - 1];

    const colorLinea = ultimoCierre < ultimoOpen
        ? '#f87171'
        : '#4ADE80';

    const colorFondo = colorLinea === '#f87171'
        ? 'rgba(248, 113, 113, 0.2)'
        : 'rgba(74, 222, 128, 0.2)';

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Precio de cierre',
                data: datosCierre,
                borderColor: colorLinea,
                backgroundColor: colorFondo,
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 0,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: { color: "#ffffff" },
                    title: { display: true, text: 'Fecha/Hora', color: "#ffffff" }
                },
                y: {
                    ticks: { color: "#ffffff" },
                    title: { display: true, text: 'Precio', color: "#ffffff" }
                }
            },
            plugins: {
                legend: {
                    labels: { color: "#ffffff" }
                }
            }
        }
    });
}

//Compra de acciones
$("#btnComprar").on("click", function () {
    const totalTexto = $("#total").text().replace("$", "").trim();
    const total = parseFloat(totalTexto);
    const userId = window.userId;

    if (!userId || isNaN(total)) {
        Swal.fire("Error", "Datos inválidos para la compra", "error");
        return;
    }

    $.ajax({
        url: API_URL_BASE + `/api/Wallet/balance/${userId}`,
        type: "GET",
        success: function (data) {
            const saldoFloat = parseFloat(data.balance);
            const saldoRestante = saldoFloat - total;

            if (saldoRestante <= 0) {
                Swal.fire("Fondos insuficientes", "Tu wallet debe quedar con saldo mayor a $0 luego de la compra.", "warning");
                return;
            }

            $.ajax({
                url: API_URL_BASE + "/api/Wallet/purchase-stock",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    idusuario: userId,
                    monto: total,
                    tipoFondo: true,
                    concepto: ""
                }),
                success: function () {
                    const ticker = simboloActual;
                    const nombre = $("#nombreAccion").text().trim();
                    const precioCompra = parseFloat($("#precioEstimado").text().replace("$", "").trim());
                    const cantidad = parseFloat($("#cantidadInput").val());
                    const precioTotal = parseFloat($("#total").text().replace("$", "").trim());

                    $.ajax({
                        url: API_URL_BASE + "/api/InversionesActivas/CreateInversion",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({
                            id: 0,
                            ticker: ticker,
                            nombre: nombre,
                            precioCompra: precioCompra,
                            precioVenta: 0,
                            activo: true,
                            id_usuario: userId,
                            cantidad: cantidad,
                            precioTotal: precioTotal
                        }),
                        success: function () {
                            Swal.fire("Compra exitosa", "La acción fue registrada en tu portafolio.", "success")
                                .then(() => window.location.reload());
                        },
                        error: function (xhr) {
                            console.error("Error al registrar inversión", xhr);
                            Swal.fire("Error", "Se descontó del wallet, pero no se registró la acción en el portafolio.", "warning");
                        }
                    });

                },
                error: function (xhr) {
                    console.error("Error al realizar la compra", xhr);
                    Swal.fire("Error", "No se pudo completar la compra.", "error");
                }
            });
        },
        error: function () {
            Swal.fire("Error", "No se pudo consultar el saldo del wallet.", "error");
        }
    });
});

function cargarSugerencia() {
    $.ajax({
        url: API_URL_BASE + "/api/Stock/StockSuggestion",
        type: "GET",
        success: function (data) {
            console.log("Sugerencia recibida:", data);
            if (data && data.message) {
                $("#recomendacion").text(data.message);
            } else {
                $("#recomendacion").text("No hay sugerencia disponible por el momento.");
            }
        },
        error: function (xhr) {
            console.error("Error al obtener sugerencia:", xhr);
            $("#recomendacion").text("Error al obtener la sugerencia.");
        }
    });
}