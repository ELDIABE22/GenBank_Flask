import { validateRegister } from './validations.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-register');
  // Valores del formulario
  const cc = document.getElementById('cc');
  const first_name = document.getElementById('first_name');
  const last_name = document.getElementById('last_name');
  const birth_date = document.getElementById('birth_date');
  const email = document.getElementById('email');
  const phone_number = document.getElementById('phone_number');
  const department = document.getElementById('department');
  const city = document.getElementById('city');
  const address = document.getElementById('address');
  const address_details = document.getElementById('address_details');
  const password = document.getElementById('password');
  const password_confirmation = document.getElementById(
    'password_confirmation'
  );
  // Secciones del formulario
  const personal_information = document.getElementById('personal_information');
  const contact_information = document.getElementById('contact_information');
  const residence_address = document.getElementById('residence_address');
  const security = document.getElementById('security');

  const btn_register = document.getElementById('btn_register');
  const button_step_back = document.getElementById('button_step_back');
  const eyeIcon = document.getElementById('eye');
  const loader = document.getElementById('loader');
  const section_register = document.getElementById('section_register');

  // Hace visible el contenido con una transición suave
  document.body.style.opacity = '1';

  let step = 1;

  let isPasswordVisible = false;

  let validate = new window.JustValidate(form);
  const notyf = new window.Notyf();

  // Función para manejar los pasos
  const handleStep = () => {
    const validationDatas = {
      cc,
      first_name,
      last_name,
      birth_date,
      email,
      phone_number,
      department,
      city,
      address,
      password,
      password_confirmation,
    };

    if (step === 1) {
      validateRegister(validate, validationDatas, step);
      validate.onSuccess(() => {
        step++;
        personal_information.classList.replace('flex', 'hidden');
        contact_information.classList.replace('hidden', 'flex');
        button_step_back.classList.replace('hidden', 'inline');
      });
    } else if (step === 2) {
      validateRegister(validate, validationDatas, step);
      validate.onSuccess(() => {
        step++;
        contact_information.classList.replace('flex', 'hidden');
        residence_address.classList.replace('hidden', 'flex');
      });
    } else if (step === 3) {
      validateRegister(validate, validationDatas, step);
      validate.onSuccess(() => {
        step++;
        residence_address.classList.replace('flex', 'hidden');
        security.classList.replace('hidden', 'flex');
        document.querySelector('#btn_register span').textContent =
          'Crear cuenta';
      });
    } else if (step === 4) {
      validateRegister(validate, validationDatas, step);
      validate.onSuccess(async () => {
        document
          .querySelectorAll(
            '#form-register input, #form-register select, #form-register button'
          )
          .forEach((el) => (el.disabled = true));
        btn_register.classList.add('loading');
        btn_register.disabled = true;

        const data = {
          cc: cc.value,
          first_name: first_name.value,
          last_name: last_name.value,
          birth_date: birth_date.value,
          email: email.value,
          phone_number: phone_number.value,
          department: department.value,
          city: city.value,
          address: address.value,
          address_details: address_details.value,
          password: password.value,
        };

        try {
          const res = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          const result = await res.json();

          if (res.status === 201) {
            notyf.success(result.message);

            setTimeout(() => {
              window.location.href = '/auth/login';
            }, 1000);
          } else {
            notyf.error(result.message);
          }
        } catch (error) {
          console.log('Error al registrar el usuario', error);
        } finally {
          btn_register.classList.remove('loading');
          btn_register.disabled = false;
          document
            .querySelectorAll(
              '#form-register input, #form-register select, #form-register button'
            )
            .forEach((el) => (el.disabled = false));
        }
      });
    }
  };

  // Función para consultar los departamentos de colombia
  const getDepartment = async () => {
    loader.style.display = 'block';
    section_register.style.display = 'none';

    try {
      const res = await fetch('https://api-colombia.com/api/v1/Department');
      const data = await res.json();

      if (data.length > 0) {
        data.forEach(
          (d) =>
            (department.innerHTML += `
            <option id="${d.id}" value="${d.name}">
                ${d.name}
            </option>
        `)
        );
      }
    } catch (error) {
      console.log('Error al obtener los departamentos', error);
    } finally {
      section_register.style.display = 'flex';
      loader.style.display = 'none';
    }
  };

  // Función para mostrar u ocultar la contraseña
  const togglePasswordVisibility = () => {
    isPasswordVisible = !isPasswordVisible;
    password.type = isPasswordVisible ? 'text' : 'password';
    password_confirmation.type = isPasswordVisible ? 'text' : 'password';

    eyeIcon.innerHTML = isPasswordVisible
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#6b7280" viewBox="0 0 256 256"><path d="M228,175a8,8,0,0,1-10.92-3l-19-33.2A123.23,123.23,0,0,1,162,155.46l5.87,35.22a8,8,0,0,1-6.58,9.21A8.4,8.4,0,0,1,160,200a8,8,0,0,1-7.88-6.69l-5.77-34.58a133.06,133.06,0,0,1-36.68,0l-5.77,34.58A8,8,0,0,1,96,200a8.4,8.4,0,0,1-1.32-.11,8,8,0,0,1-6.58-9.21L94,155.46a123.23,123.23,0,0,1-36.06-16.69L39,172A8,8,0,1,1,25.06,164l20-35a153.47,153.47,0,0,1-19.3-20A8,8,0,1,1,38.22,99c16.6,20.54,45.64,45,89.78,45s73.18-24.49,89.78-45A8,8,0,1,1,230.22,109a153.47,153.47,0,0,1-19.3,20l20,35A8,8,0,0,1,228,175Z"></path></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#6b7280" viewBox="0 0 256 256"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path></svg>';
  };

  // Función para resetear validaciones
  const resetValidation = () => {
    validate.destroy();
    validate = new window.JustValidate(form);
  };

  getDepartment();

  // Eventos
  department.addEventListener('change', async () => {
    city.disabled = true;
    department.disabled = true;
    const selectedOption = department.options[department.selectedIndex];
    const departmentId = selectedOption.id;

    if (departmentId) {
      try {
        const res = await fetch(
          `https://api-colombia.com/api/v1/Department/${departmentId}/cities`
        );
        const data = await res.json();

        if (data.length > 0) {
          data.forEach(
            (c) =>
              (city.innerHTML += `
            <option id="${c.id}" value="${c.name}">
                ${c.name}
            </option>
        `)
          );

          city.disabled = false;
          department.disabled = false;
        }
      } catch (error) {
        console.log('Error al obtener las ciudades del departamento', error);
      } finally {
        department.disabled = false;
      }
    }
  });

  button_step_back.addEventListener('click', () => {
    resetValidation();
    step--;

    if (step === 1) {
      personal_information.classList.replace('hidden', 'flex');
      contact_information.classList.replace('flex', 'hidden');
      button_step_back.classList.add('hidden');
    } else if (step === 2) {
      contact_information.classList.replace('hidden', 'flex');
      residence_address.classList.replace('flex', 'hidden');
    } else if (step === 3) {
      residence_address.classList.replace('hidden', 'flex');
      security.classList.replace('flex', 'hidden');
      document.querySelector('#btn_register span').textContent = 'Siguiente';
    }
  });

  btn_register.addEventListener('click', () => handleStep(step));
  eyeIcon.addEventListener('click', () => togglePasswordVisibility());
});
