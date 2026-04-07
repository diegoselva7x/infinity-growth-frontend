$(document).ready(function () {
    Swal.showLoading();

    // Cargar dashboard financiero Admin
    $.ajax({
        url: API_URL_BASE + `/api/Reporte/ObtenerResumenAdmin`,
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.result === "OK" && response.data.length > 0) {
                const resumen = response.data[0];

                $("#totalInvertido").text(`$${resumen.totalInvertidoPlataforma.toLocaleString()}`);
                $("#gananciasGeneradas").text(`$${resumen.gananciasGeneradas.toLocaleString()}`);
                $("#perdidasGeneradas").text(`$${resumen.perdidasGeneradas.toLocaleString()}`);
                $("#comisionesPlataforma").text(`$${resumen.comisionPlataformaTotal.toLocaleString()}`);
                $("#volumenMovido").text(`$${resumen.volumenMovidoMensual.toLocaleString()}`);
                $("#accionMasRentable").text(resumen.accionMasRentable || "-");
                $("#accionMenosRentable").text(resumen.accionMenosRentable || "-");
            } else {
                mostrarError("No se pudo cargar el resumen financiero del administrador.");
            }
        },
        error: function () {
            mostrarError("Error al obtener el resumen financiero del administrador.");
        }
    });

    // Cargar tabla clientes - Grid.js
    $.ajax({
        url: API_URL_BASE + `/api/Reporte/ObtenerDetalleClientesAdmin`,
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            Swal.close();

            if (response.result === "OK") {
                const clientes = response.data.map(function (item) {
                    const rendimientoClass = item.rendimiento >= 0
                        ? 'text-[var(--positive-color)]'
                        : 'text-[var(--negative-color)]';

                    return [
                        gridjs.html(`<span class="text-[var(--text-primary)]">${item.nombreAsesor || "Sin asesor asignado"}</span>`),
                        gridjs.html(`<span class="text-[var(--text-primary)]">${item.nombre}</span>`),
                        gridjs.html(`<span class="text-[var(--text-primary)]">$${item.ingresos.toLocaleString()}</span>`),
                        gridjs.html(`<span class="text-[var(--text-primary)]">$${item.ganancias.toLocaleString()}</span>`),
                        gridjs.html(`<span class="text-[var(--text-primary)]">$${item.perdidas.toLocaleString()}</span>`),
                        gridjs.html(`<span class="font-semibold ${rendimientoClass}">${item.rendimiento > 0 ? '+' : ''}${item.rendimiento}%</span>`)
                    ];
                });

                new gridjs.Grid({
                    columns: [
                        "Asesor",
                        "Cliente",
                        "Ingresos",
                        "Ganancias",
                        "Pérdidas",
                        "Rendimiento"
                    ],
                    data: clientes,
                    search: {
                        enabled: true,
                        placeholder: '🔍 Buscar...'
                    },
                    language: {
                        search: { placeholder: '🔍 Buscar...' },
                        loading: 'Cargando...',
                        noRecordsFound: 'No se encontraron registros',
                        error: 'Error al cargar los datos'
                    }
                }).render(document.getElementById("tabla-admin"));
            } else {
                mostrarError("No se pudo cargar el detalle de clientes.");
            }
        },
        error: function () {
            Swal.close();
            mostrarError("Ocurrió un error al obtener el detalle de clientes.");
        }
    });

    function mostrarError(mensaje) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje
        });
    }
});
