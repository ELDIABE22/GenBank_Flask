import { validateLogin, validateGenerateResetPassword } from './validations.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-login');
  // Valores del formulario
  const cc = document.getElementById('cc');
  const password = document.getElementById('password');
  const resetPassword = document.getElementById('reset-password');

  const eyeIcon = document.getElementById('eye');
  const btn_login = document.getElementById('btn_login');

  // Hace visible el contenido con una transición suave
  document.body.style.opacity = '1';

  const notyf = new window.Notyf();

  let isPasswordVisible = false;

  //   Función para enviar los datos del formulario al servidor
  const handleLogin = async () => {
    document
      .querySelectorAll(
        '#form-login input, #form-login select, #form-login button'
      )
      .forEach((el) => (el.disabled = true));

    btn_login.classList.add('loading');
    btn_login.disabled = true;

    const data = {
      cc: cc.value.trim(),
      password: password.value.trim(),
    };

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.status === 200) {
        document.cookie = `token=${result.token}; path=/; Secure; max-age=3600`;
        localStorage.setItem('userData', JSON.stringify(result.user));
        notyf.success(result.message);

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        notyf.error(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      btn_login.classList.remove('loading');
      btn_login.disabled = false;
      document
        .querySelectorAll(
          '#form-login input, #form-login select, #form-login button'
        )
        .forEach((el) => (el.disabled = false));
    }
  };

  const handleRequestResetPassword = async (email, modalContainer) => {
    document
      .querySelectorAll(
        '#form-password-reset input, #form-password-reset button'
      )
      .forEach((el) => (el.disabled = true));

    try {
      const res = await fetch('/api/v1/auth/password/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await res.json();

      if (res.status === 200) {
        notyf.success(data.message);
        modalContainer.remove();
      } else {
        notyf.error(data.message);
      }
    } catch (error) {
      console.error('Error al enviar el correo de restablecimiento:', error);
    } finally {
      document
        .querySelectorAll(
          '#form-password-reset input, #form-password-reset button'
        )
        .forEach((el) => (el.disabled = false));
    }
  };

  // Validar campos del formulario y hacer el submit
  validateLogin(form, handleLogin, { cc, password });

  //   Función para mostrar u ocultar la contraseña
  const togglePasswordVisibility = () => {
    isPasswordVisible = !isPasswordVisible;
    password.type = isPasswordVisible ? 'text' : 'password';

    eyeIcon.innerHTML = isPasswordVisible
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#6b7280" viewBox="0 0 256 256"><path d="M228,175a8,8,0,0,1-10.92-3l-19-33.2A123.23,123.23,0,0,1,162,155.46l5.87,35.22a8,8,0,0,1-6.58,9.21A8.4,8.4,0,0,1,160,200a8,8,0,0,1-7.88-6.69l-5.77-34.58a133.06,133.06,0,0,1-36.68,0l-5.77,34.58A8,8,0,0,1,96,200a8.4,8.4,0,0,1-1.32-.11,8,8,0,0,1-6.58-9.21L94,155.46a123.23,123.23,0,0,1-36.06-16.69L39,172A8,8,0,1,1,25.06,164l20-35a153.47,153.47,0,0,1-19.3-20A8,8,0,1,1,38.22,99c16.6,20.54,45.64,45,89.78,45s73.18-24.49,89.78-45A8,8,0,1,1,230.22,109a153.47,153.47,0,0,1-19.3,20l20,35A8,8,0,0,1,228,175Z"></path></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#6b7280" viewBox="0 0 256 256"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path></svg>';
  };

  // Evento para mostrar el modal de realizar deposito
  resetPassword.addEventListener('click', () => {
    resetPassword.blur();

    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-reset-password';
    modalContainer.className =
      'absolute inset-0 flex justify-center items-center z-[100] bg-black/60 transition-opacity duration-300 opacity-0';
    modalContainer.innerHTML = `
        <form
        id="form-password-reset"
        class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg scale-95 transition-transform duration-300"
      >
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-2">
          ¿Olvidaste tu contraseña?
        </h2>
        <p class="text-gray-600 text-center mb-4">
          Ingresa tu correo electrónico y te enviaremos un enlace para
          restablecer tu contraseña.
        </p>

        <div class="flex justify-center mb-6">
          <img
            src="https://icons.veryicon.com/png/o/miscellaneous/test-2/reset-password-1.png"
            alt="Recuperar contraseña"
            class="w-20 h-20"
          />
        </div>

        <div class="mb-6">
          <label
            for="email"
            class="block text-gray-700 font-semibold mb-2 text-center"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            placeholder="tucorreo@ejemplo.com"
            class="mx-auto block w-80 max-w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div class="bg-blue-50 p-4 rounded-lg text-blue-700 text-sm mb-6">
          <p>✔ Te enviaremos un correo con instrucciones</p>
          <p>✔ El enlace será válido solo por tiempo limitado</p>
          <p>✔ Asegúrate de revisar también tu bandeja de spam</p>
        </div>

        <div class="flex justify-center space-x-4">
          <button type="submit" id="sendResetLinkBtn" class="btn">
            <div class="loader_button"></div>
            <span>Enviar enlace</span>
          </button>
          <button id="cancelResetBtn" class="btn bg-red-500 hover:bg-red-600">
            Cancelar
          </button>
        </div>

        <p class="text-gray-400 text-xs text-center mt-4">
          Tus datos están protegidos con encriptación segura.
        </p>
      </form>
    `;

    document.getElementById('body-login').appendChild(modalContainer);

    const form = modalContainer.querySelector('#form-password-reset');
    const email = modalContainer.querySelector('#email');

    // Animación de entrada
    setTimeout(() => {
      modalContainer.classList.remove('opacity-0');
      modalContainer.classList.add('opacity-100');
      form.classList.remove('scale-95');
      form.classList.add('scale-100');
    }, 10);

    // Evento para cerrar el modal
    document.getElementById('cancelResetBtn').addEventListener('click', () => {
      modalContainer.classList.remove('opacity-100');
      modalContainer.classList.add('opacity-0');

      setTimeout(() => {
        document.getElementById('body-login').removeChild(modalContainer);
      }, 10);
    });

    // Llamar función para validar el formulario y realizar el depósito
    validateGenerateResetPassword(form, handleRequestResetPassword, {
      email,
      modalContainer,
    });
  });

  eyeIcon.addEventListener('click', togglePasswordVisibility);
});
