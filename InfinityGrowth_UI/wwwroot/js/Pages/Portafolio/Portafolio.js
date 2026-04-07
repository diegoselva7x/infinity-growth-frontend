document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.tab-button');
    const tabs = document.querySelectorAll('.tab-content');

    // Cambiar entre tabs (Portfolio / Wallet)
    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const target = button.getAttribute('data-tab');
            tabs.forEach(tab => tab.classList.add('hidden'));
            document.getElementById(target)?.classList.remove('hidden');

            buttons.forEach(btn => {
                btn.classList.remove('text-white', 'border-[var(--primary-color)]');
                btn.classList.add('text-gray-400', 'border-transparent');
            });

            button.classList.remove('text-gray-400', 'border-transparent');
            button.classList.add('text-white', 'border-[var(--primary-color)]');
        });
    });

    const agregarFondosBtn = document.getElementById('btnAgregarFondos');
    const montoInput = document.getElementById('idCantidadDinero');

    let currentOrderId = null;

    if (agregarFondosBtn && montoInput) {
        agregarFondosBtn.addEventListener('click', async function () {
            const monto = parseFloat(montoInput.value);
            if (isNaN(monto) || monto <= 0) {
                alert("Ingrese un monto válido.");
                return;
            }

            console.log("Botón presionado con monto: ", monto);

            try {
                // Crear orden de PayPal en el backend
                const response = await fetch('/Wallet/CrearOrden', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: monto, currencyCode: "USD" })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Error al crear la orden:", errorText);
                    alert("Hubo un problema al crear la orden.");
                    return;
                }

                const plainResponse = await response.text();
                let data;
                try {
                    data = JSON.parse(plainResponse);
                } catch (e) {
                    console.error("No se pudo parsear la respuesta como JSON:", e);
                    alert("La respuesta del servidor no es válida.");
                    return;
                }

                currentOrderId = data.orderId;
                console.log("Nueva orden creada:", data);

                const approveWindow = window.open(data.approveUrl, '_blank');
                if (!approveWindow) {
                    alert("Tu navegador bloqueó la ventana emergente. Permití ventanas emergentes para continuar.");
                    return;
                }

                // Monitorear si el usuario cierra la ventana de PayPal
                const interval = setInterval(() => {
                    if (approveWindow.closed) {
                        clearInterval(interval);

                        // Capturar la orden
                        $.ajax({
                            url: '/Wallet/CapturarOrden',
                            method: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify({ orderId: currentOrderId, monto: monto }),
                            success: function (captureData) {
                                console.log("Captura realizada:", captureData);
                                alert(captureData.message || "Fondos agregados exitosamente.");

                                // ✉️ Enviar correo de confirmación con diseño mejorado
                                const fecha = new Date().toLocaleString(); // Fecha actual local
                                const htmlContent = `
                                <html>
                                  <body style="margin:0; font-family: 'Segoe UI', sans-serif; background-color: #18191C; padding: 20px;">
                                    <div style="max-width: 600px; margin: auto; background-color: #23262E; padding: 30px; border-radius: 12px; color: #FFFFFF;">
                                      <div style="text-align: right; margin-bottom: 20px;">
                                        <img src="https://i.postimg.cc/prrMnWZz/logo-png-dark.png" alt="Logo" style="height: 40px;">
                                      </div>
                                      <h2>Depósito confirmado</h2>
                                      <p style="font-size: 15px; color: #CCCCCC;">
                                        Hemos recibido su depósito exitosamente. El monto de <strong>$${monto.toFixed(2)}</strong> ha sido acreditado a su cuenta.
                                      </p>
                                      <p style="font-size: 15px; color: #CCCCCC;">
                                        Fecha: <strong>${fecha}</strong><br>
                                      </p>
                                      <p style="font-size: 14px; color: #999999;">Gracias por confiar en Infinity Growth.</p>
                                    </div>
                                  </body>
                                </html>`;

                                const subject = "Depósito confirmado - Infinity Growth";
                                const plainTextContent = `Hemos recibido su depósito de $${monto.toFixed(2)} en su cuenta. Fecha: ${fecha}`;

                                $.ajax({
                                    url: API_URL_BASE + "/api/Communications/SendEmail",
                                    method: "POST",
                                    contentType: "application/json",
                                    data: JSON.stringify({
                                        emailAddres: userEmail,
                                        subject: subject,
                                        plainTextContent: plainTextContent,
                                        htmlContent: htmlContent
                                    }),
                                    success: function (res) {
                                        Swal.fire({
                                            icon: 'success',
                                            title: 'Correo enviado',
                                            text: 'El correo se ha enviado correctamente.',
                                            confirmButtonText: 'Aceptar'
                                        });
                                    },
                                    error: function (xhr, status, error) {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Error al enviar el correo',
                                            text: 'Hubo un problema al intentar enviar el correo.',
                                            confirmButtonText: 'Aceptar'
                                        });
                                    }
                                });
                            },
                            error: function (xhr, status, error) {
                                console.error("Error al capturar orden:", error);
                                alert("Hubo un problema al capturar el pago.");
                            },
                            complete: function () {
                                currentOrderId = null; // ✅ Esto va aquí, siempre se limpia
                            }
                        });
                    }
                }, 2000);

            } catch (error) {
                console.error("Error al procesar el pago:", error);
                alert("Ocurrió un error inesperado.");
            }
        });
    }
});


$(document).ready(function () {
    const userId = parseInt(window.userId);
    if (!userId || userId <= 0) {
        console.error("❌ ID de usuario no definido correctamente.");
        return;
    }  // Asignado desde Razor

    $.ajax({
        url: API_URL_BASE + `/api/Wallet/balance/${userId}`,
        method: "GET",
        contentType: "application/json",
        success: function (balanceData) {
            if (balanceData && typeof balanceData.balance === "number") {
                const saldoElement = document.getElementById("saldoActual");
                if (saldoElement) {
                    saldoElement.textContent = `$${balanceData.balance.toFixed(2)}`;
                }
            }
        },
        error: function (xhr, status, error) {
            console.error("Error al obtener el saldo inicial del wallet:", error);
        }
    });

    $.ajax({
        url: API_URL_BASE + `/api/InversionesActivas/GetInversionesActivasByUserId/${userId}`,
        method: "GET",
        contentType: "application/json",
        success: function (response) {
            if (response.result === "OK" && response.data) {
                const inversiones = response.data;
                const contenedor = $("#miPortafolio");

                inversiones.forEach(inv => {
                    const { idActivo, ticker, cantidad, gananciaMonetaria, gananciaPorcentual } = inv;
                    const tarjeta = `
                    <div class="flex justify-between items-center p-4 rounded-md bg-[var(--accent-color)] shadow-md text-white w-full">
                        <div class="flex items-center gap-4">
                            <span class="hidden">${idActivo}</span>
                            <img src="/public/icons/${ticker}.svg" alt="${ticker}" class="w-6 h-6">
                            <div>
                                <p class="font-semibold text-base leading-none">${ticker}</p>
                                <p class="text-sm text-gray-400 leading-none">${cantidad}</p>
                            </div>
                        </div>
                        <div class="text-right mr-4">
                            <p class="text-base font-bold leading-none">${gananciaMonetaria.toFixed(2)}</p>
                            <p class="${gananciaPorcentual < 0 ? 'text-red-500' : 'text-green-500'} text-sm font-semibold leading-none">
                                ${gananciaPorcentual.toFixed(2)}%
                            </p>
                        </div>
                        <button class="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded">Vender</button>
                    </div>
                `;

                    contenedor.append(tarjeta);
                });
            } else {
                console.warn("No hay inversiones activas.");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error al obtener inversiones activas:", error);
        }
    });

    if (typeof userId !== 'undefined') {
        Swal.showLoading();

        $.ajax({
            url: API_URL_BASE + `/api/Wallet/transactions/${userId}`,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                Swal.close();

                const transacciones = response.map(function (item) {
                    const tipo = item.tipoFondo
                        ? gridjs.html(`<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-300 text-green-900">Depósito</span>`)
                        : gridjs.html(`<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-300 text-yellow-900">Compra</span>`);

                    const fecha = new Date(item.fecha).toLocaleDateString();
                    const monto = `$${parseFloat(item.monto).toFixed(2)}`;

                    return [fecha, tipo, monto];
                });

                new gridjs.Grid({
                    columns: ["Fecha", "Tipo", "Monto"],
                    data: transacciones,
                    search: {
                        enabled: true,
                        placeholder: '🔍 Buscar...'
                    },
                    pagination: {
                        enabled: true,
                        limit: 5
                    },
                    language: {
                        search: { placeholder: '🔍 Buscar...' },
                        loading: 'Cargando...',
                        noRecordsFound: 'No se encontraron movimientos',
                        error: 'Error al cargar los datos',
                        pagination: {
                            previous: 'Anterior',
                            next: 'Siguiente',
                            showing: 'Mostrando',
                            results: () => 'resultados'
                        }
                    }
                }).render(document.getElementById("wallet-transactions"));
            },
            error: function () {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo obtener el historial del wallet.'
                });
            }
        });
    }
});


