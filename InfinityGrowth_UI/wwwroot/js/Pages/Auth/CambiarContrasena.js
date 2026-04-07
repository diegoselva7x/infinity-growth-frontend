function CambiarContrasenaManager() {
    this.InitView = () => {
        this.InitEvents();
    };

    this.InitEvents = () => {
        $("#btnEnviarCorreo").on("click", (e) => {
            e.preventDefault();
            this.EnviarOTP();
        });

        $("#btnValidarOTP").on("click", (e) => {
            e.preventDefault();
            this.ValidarOTP();
        });

        $("#btnCambiarPassword").on("click", (e) => {
            e.preventDefault();
            this.CambiarPassword();
        });

        $("#newPassword").on("input", () => {
            const pwd = $("#newPassword").val();

            const requirements = {
                length: pwd.length >= 8,
                uppercase: /[A-Z]/.test(pwd),
                lowercase: /[a-z]/.test(pwd),
                number: /[0-9]/.test(pwd),
                special: /[!@#$%^&*]/.test(pwd)
            };

            Object.entries(requirements).forEach(([key, isValid]) => {
                const $item = $(`#passwordRequirements [data-rule="${key}"]`);
                $item.find(".icon").text(isValid ? "✅" : "❌");
                $item.toggleClass("text-green-600", isValid);
                $item.toggleClass("text-gray-700", !isValid);
            });
        });
    };

    this.EnviarOTP = () => {
        let correo = $("#correo").val().trim();

        if (!correo) {
            Swal.fire({
                icon: 'warning',
                title: 'Correo requerido',
                text: 'Por favor, ingresa tu correo electrónico'
            });
            return;
        }

        $.ajax({
            url: API_URL_BASE + "/api/Auth/GetUserForReset",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ correo: correo })
        }).done((result) => {
            if (result.result === "OK") {
                sessionStorage.setItem("idUsuario", result.data);
                Swal.fire({
                    icon: 'success',
                    title: 'Código enviado',
                    text: result.message,
                    position: "top-end",
                    timer: 2000,
                    timerProgressBar: true
                });
                $("#otpSection").removeClass("hidden");
                $("#emailSection").addClass("hidden");
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al enviar OTP',
                    text: result.message || 'No se pudo enviar el código OTP',
                    position: "top-end",
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        }).fail(() => {
            Swal.fire({
                icon: 'error',
                title: 'Error del servidor',
                text: 'No se pudo enviar el código OTP',
                position: "top-end",
                timer: 2000,
                timerProgressBar: true
            });
        });
    };

    this.ValidarOTP = () => {
        let idUsuario = sessionStorage.getItem("idUsuario");
        let otp = $("#otp").val().trim();

        if (!otp) {
            Swal.fire({
                icon: 'warning',
                title: 'Código requerido',
                text: 'Ingresa el código OTP recibido por correo',
                position: "top-end",
                timer: 2000,
                timerProgressBar: true
            });
            return;
        }

        var data = {
            Id_Usuario: idUsuario,
            Otp_Code: otp
        };

        $.ajax({
            url: API_URL_BASE + "/api/Auth/ValidateOTP",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(data)
        }).done((result) => {
            if (result.result === "OK") {
                Swal.fire({
                    icon: 'success',
                    title: 'OTP válido',
                    text: 'Ahora puedes cambiar tu contraseña',
                    position: "top-end",
                    timer: 2000,
                    timerProgressBar: true
                });
                $("#passwordSection").removeClass("hidden");
                $("#otpSection").addClass("hidden");
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'OTP incorrecto',
                    text: result.message || 'El código ingresado no es válido',
                    position: "top-end",
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        }).fail(() => {
            Swal.fire({
                icon: 'error',
                title: 'Error del servidor',
                text: 'No se pudo validar el código OTP',
                position: "top-end",
                timer: 2000,
                timerProgressBar: true
            });
        });
    };

    this.CambiarPassword = () => {
        let correo = $("#correo").val().trim();
        let newPassword = $("#newPassword").val().trim();
        let confirmPassword = $("#confirmPassword").val().trim();

        if (!newPassword || !confirmPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Debes completar ambos campos de contraseña'
            });
            return;
        }

        if (newPassword.length < 8 ||
            !/[A-Z]/.test(newPassword) ||
            !/[a-z]/.test(newPassword) ||
            !/[0-9]/.test(newPassword) ||
            !/[!@#$%^&*]/.test(newPassword)
        ) {
            Swal.fire({
                icon: 'warning',
                title: 'Contraseña inválida',
                text: 'Asegúrate de cumplir todos los requisitos antes de continuar'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Contraseñas no coinciden',
                text: 'Las contraseñas ingresadas no son iguales'
            });
            return;
        }

        let data = {
            correo: correo,
            newPassword: newPassword,
            confirmNewPassword: confirmPassword
        };

        $.ajax({
            url: API_URL_BASE + "/api/Auth/UpdatePassword",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(data)
        }).done((result) => {
            if (result.result === "OK") {
                Swal.fire({
                    icon: 'success',
                    title: 'Contraseña actualizada',
                    text: result.message || 'La contraseña se ha cambiado correctamente',
                    confirmButtonText: 'Ir al Login'
                }).then(() => {
                    window.location.href = "/Auth/Login";
                    sessionStorage.removeItem("idUsuario");
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cambiar contraseña',
                    text: result.message,
                    position: "top-end",
                    timer: 2000,
                    timerProgressBar: true
                });
            }
        }).fail(() => {
            Swal.fire({
                icon: 'error',
                title: 'Error del servidor',
                text: 'No se pudo cambiar la contraseña',
                position: "top-end",
                timer: 2000,
                timerProgressBar: true
            });
        });
    };
}

$(document).ready(() => {
    let manager = new CambiarContrasenaManager();
    manager.InitView();
});
