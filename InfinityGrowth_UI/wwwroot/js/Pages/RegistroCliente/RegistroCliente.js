document.addEventListener("DOMContentLoaded", function () {
    const dropArea = document.getElementById('drop-area');
    const input = document.getElementById('Foto');
    const preview = document.getElementById('preview');
    const displayText = document.getElementById('display-text');

    dropArea.addEventListener('click', () => input.click());

    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('opacity-50');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('opacity-50');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        dropArea.classList.remove('opacity-50');
        handleFile(file);
    });

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFile(file);
    });

    function handleFile(file) {
        if (!file || !file.type || !file.type.startsWith('image/')) {
            Swal.fire({
                icon: 'error',
                title: 'Formato de imagen inválido',
                text: 'Por favor, selecciona una imagen correcta.'
            });
            input.value = '';
            preview.classList.add('hidden');
            displayText.classList.remove('hidden');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            displayText.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }

    const form = document.querySelector("form");

    if (form) {
        form.addEventListener("input", function (e) {
            const input = e.target;

            // Encuentra el span de validación usando el atributo data-valmsg-for (que ASP.NET pone por defecto)
            const fieldName = input.name;

            if (!fieldName) return;

            const validationMessage = form.querySelector(`span[data-valmsg-for="${fieldName}"]`);

            if (validationMessage && input.value.trim() !== "") {
                validationMessage.textContent = "";
            }
        });
    }
});

flatpickr("#fechaNacimiento", {
    dateFormat: "Y-m-d",
    maxDate: "today",
    locale: "es",
    allowInput: true
});

