$(document).ready(function () {
    if (typeof userId !== 'undefined') {
        Swal.showLoading(); // Mostrar loading mientras trae datos

        $.ajax({
            url: API_URL_BASE + `/api/Reporte/ObtenerTransaccionesPorUsuario/${userId}`,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                Swal.close(); // Cerrar loading

                if (response.result === "OK") {
                    const transacciones = response.data.map(function (item) {
                        const tipoTransaccion = item.tipoTransaccion
                            ? gridjs.html(`<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-300 text-green-900">Compra</span>`)
                            : gridjs.html(`<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-300 text-red-900">Venta</span>`);

                        return [
                            new Date(item.fecha).toLocaleDateString(),
                            gridjs.html(`<span class="text-[var(--text-primary)]">${item.nombre}</span>`),
                            tipoTransaccion,
                            gridjs.html(`<span class="text-[var(--text-primary)]">${item.cantidad}</span>`),
                            gridjs.html(`<span class="text-[var(--text-primary)]">$${item.precioCompra.toLocaleString()}</span>`),
                            gridjs.html(`<span class="text-[var(--text-primary)]">$${item.precioTotal.toLocaleString()}</span>`)
                        ];
                    });

                    new gridjs.Grid({
                        columns: [
                            "Fecha",
                            "Activo",
                            "Tipo",
                            "Cantidad",
                            "Precio Unitario",
                            "Total"
                        ],
                        data: transacciones,
                        search: {
                            enabled: true,
                            placeholder: '🔍 Buscar...'
                        },
                        language: {
                            search: { placeholder: '🔍 Buscar...' },
                            loading: 'Cargando...',
                            noRecordsFound: 'No se encontraron transacciones',
                            error: 'Error al cargar los datos'
                        }
                    }).render(document.getElementById("grid-table"));
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Atención',
                        text: 'No se pudieron cargar las transacciones.'
                    });
                }
            },
            error: function (xhr, status, error) {
                Swal.close();

                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al obtener las transacciones.'
                });
                console.error('Error en la solicitud Ajax:', error);
            }
        });
        //Llamada al API para obtener informacion del dasboard
        $.ajax({
            url: API_URL_BASE + `/api/Reporte/ObtenerClienteDetalle/${userId}`,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                if (response.result === "OK") {
                    const resumen = response.data;
        
                    $("#totalInvertido").text(`$${resumen.totalInvertido.toLocaleString()}`);
                    $("#gananciaAcumulada").text(`$${resumen.gananciaAcumulada.toLocaleString()}`);
                    $("#perdidaAcumulada").text(`$${resumen.perdidaAcumulada.toLocaleString()}`);
                    $("#comisionPagada").text(`$${resumen.comisionPagada.toLocaleString()}`);
                    $("#accionMasRentable").text(resumen.accionMasRentable);
                    $("#accionConMayorPerdida").text(resumen.accionMenosRentable);
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Atención',
                        text: 'No se pudo cargar el resumen financiero.'
                    });
                }
            },
            error: function () {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al obtener el resumen financiero.'
                });
            }
        });
        
    }
});
