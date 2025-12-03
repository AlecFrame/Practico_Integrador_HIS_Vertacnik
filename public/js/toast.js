
function toast(msg, campo = null, type = "success") {
  const box = document.createElement("div");
  box.id = "Toast-" + Date.now();
  box.innerText = msg;

  console.log(box.id+": ", msg);

  if (campo) {
    box.className = `toastHIS toast-${campo.name} ${type}`;
    const parent = campo.parentElement;
    parent.appendChild(box);

    box.style.position = "absolute";
    box.style.left = campo.offsetLeft+"px";
    box.style.top = campo.offsetTop + campo.offsetHeight - 12 + "px";

    campo.classList.add("is-invalid");
    setTimeout(() => removeInvalidTimeOut(box.id, campo), 3500);
  } else {
    document.body.appendChild(box);

    box.style.position = "fixed";
    box.style.left = "50%";
    box.style.top = "20px";
    box.style.transform = "translateX(-50%)";
  }

  // Activar fade-in
  setTimeout(() => {
    box.classList.add("fadein");
  }, 10);

  // Quitar fade-in antes de eliminar
  setTimeout(() => {
    box.classList.remove("fadein");
  }, 3500);

  // Eliminar el toast una vez finalizada la transición
  setTimeout(() => {
    box.remove();
  }, 4000);
}

// Para que el campo en rojo no se vaya antes de tiempo por un toast anterior ya eliminado
function removeInvalidTimeOut(boxId, campo) {
  const box = document.getElementById(boxId);

  if (box) {
    campo.classList.remove("is-invalid")
  }
}

// Para limpiar el document de toasts
function removeToasts() {
  const toasts = document.getElementsByClassName("toastHIS");

  if (toasts.length > 0) {
    Array.from(toasts).forEach(toast => toast.remove());
  }
}

// Limpia erroes al escribir en su respectivo campo en el formulario
function activarLimpiadorErrores(form) {
  if (form) {
    const campos = form.querySelectorAll("input, select, textarea");

    campos.forEach(campo => {
      campo.addEventListener("input", () => {

        // Remover clase de error si existe
        campo.classList.remove("is-invalid");

        // Remover toast asociado a este campo
        const toasts = document.getElementsByClassName(`toast-${campo.name}`);

        if (toasts.length > 0) {
          Array.from(toasts).forEach(toast => toast.remove());
        }
      });
    });
  }
}