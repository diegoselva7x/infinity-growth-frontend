$(document).ready(function () {
    Swal.showLoading();
    
    // Cargar dashboard del asesor
    $.ajax({
        url: API_URL_BASE + `/api/Reporte/ObtenerAsesorDetalle/${idAsesor}`,
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.result === "OK") {
                const resumen = response.data;

                $("#totalInvertido").text(`$${resumen.totalInvertidoPorClientes.toLocaleString()}`);
                $("#comisionesGeneradas").text(`$${resumen.totalComisionesGeneradas.toLocaleString()}`);
                $("#gananciasAcumuladas").text(`$${resumen.gananciasAcumuladas.toLocaleString()}`);
                $("#perdidasAcumuladas").text(`$${resumen.perdidasAcumuladas.toLocaleString()}`);

                const rendimiento = calcularRendimiento(
                    resumen.gananciasAcumuladas,
                    resumen.totalInvertidoPorClientes
                );
                const rendimientoClass = rendimiento >= 0 ? 'text-[var(--positive-color)]' : 'text-[var(--negative-color)]';

                $("#rendimientoPromedio")
                    .text(`${rendimiento}%`)
                    .removeClass("text-[var(--positive-color)] text-[var(--negative-color)]")
                    .addClass(rendimientoClass);

                $("#accionMasRentable").text(resumen.accionMasRentable);
                $("#accionMenosRentable").text(resumen.accionMenosRentable);
            } else {
                mostrarError("No se pudo cargar el resumen financiero del asesor.");
            }
        },
        error: function () {
            mostrarError("Error al obtener el resumen financiero del asesor.");
        }
    });

    // Cargar tabla de clientes del asesor
    $.ajax({
        url: API_URL_BASE + `/api/Reporte/ObtenerReporteAsesor/${idAsesor}`,
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            Swal.close();

            if (response.result === "OK") {
                const clientes = response.data.map(function (item) {
                    const rendimientoClass = item.rendimientoTotal >= 0
                        ? 'text-[var(--positive-color)]'
                        : 'text-[var(--negative-color)]';

                    return [
                        gridjs.html(`<span class="text-[var(--text-primary)]">${item.nombre}</span>`),
                        gridjs.html(`<span class="text-[var(--text-primary)]">$${item.inversionTotal.toLocaleString()}</span>`),
                        gridjs.html(`<span class="text-[var(--text-primary)]">$${item.ganancias.toLocaleString()}</span>`),
                        gridjs.html(`<span class="text-[var(--text-primary)]">$${item.perdidas.toLocaleString()}</span>`),
                        gridjs.html(`<span class="text-[var(--text-primary)]">$${item.comisionGeneradaDelUsuario.toLocaleString()}</span>`),
                        gridjs.html(`<span class="font-semibold ${rendimientoClass}">${item.rendimientoTotal > 0 ? '+' : ''}${item.rendimientoTotal}%</span>`),
                        gridjs.html(`
                            <button 
                                onclick="mostrarConfirmacionInversion(${item.id_Usuario}, '${item.nombre}')"
                                class="text-sm font-semibold text-[var(--link-color)] underline hover:text-[var(--hover-color)]">
                                Invertir con cliente
                            </button>
                        `)
                    ];
                });

                new gridjs.Grid({
                    columns: [
                        "Cliente",
                        "Inversión",
                        "Ganancias",
                        "Pérdidas",
                        "Comisión Generada",
                        "Rendimiento",
                        "Acción"
                    ],
                    data: clientes,
                    search: {
                        enabled: true,
                        placeholder: '🔍 Buscar...'
                    },
                    language: {
                        search: { placeholder: '🔍 Buscar...' },
                        loading: 'Cargando...',
                        noRecordsFound: 'No se encontraron clientes',
                        error: 'Error al cargar los datos'
                    }
                }).render(document.getElementById("grid-table"));
            } else {
                mostrarError("No se pudieron cargar los clientes.");
            }
        },
        error: function () {
            Swal.close();
            mostrarError("Ocurrió un error al obtener los clientes.");
        }
    });

    function calcularRendimiento(ganancia, invertido) {
        if (invertido === 0) return 0;
        return ((ganancia / invertido) * 100).toFixed(1);
    }

    function mostrarError(mensaje) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje
        });
    }
});

// ✅ Confirmación de inversión con alerta y balance real
function mostrarConfirmacionInversion(idCliente, nombreCliente) {
    Swal.showLoading();

    $.ajax({
        url: API_URL_BASE + `/api/Wallet/balance/${idCliente}`,
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            Swal.close();

            if (response && response.balance !== undefined) {
                const balance = response.balance;

                Swal.fire({
                    title: '¿Confirmar inversión?',
                    html: `<strong>${nombreCliente}</strong><br/>Dinero disponible: <b>$${balance.toLocaleString()}</b>`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, invertir',
                    cancelButtonText: 'Cancelar',
                    customClass: {
                        popup: 'swal2-popup',
                        title: 'swal2-title',
                        content: 'swal2-content',
                        confirmButton: 'swal2-confirm'
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = `/Inversiones/Inversiones?idCliente=${idCliente}&nombreCliente=${encodeURIComponent(nombreCliente)}`;
                    }
                });
            } else {
                mostrarError("No se pudo obtener el balance del cliente.");
            }
        },
        error: function () {
            Swal.close();
            mostrarError("Hubo un problema al consultar el balance del cliente.");
        }
    });
}
