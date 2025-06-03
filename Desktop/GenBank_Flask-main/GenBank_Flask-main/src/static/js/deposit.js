import { getCookie } from './token.js';
import { animateNumber } from './utils.js';
import { validateDeposit } from './validations.js';

document.addEventListener('DOMContentLoaded', () => {
  const selectAccount = document.getElementById('accounts');
  const last4Digits = document.getElementById('last-4-digits');
  const balanceAccount = document.getElementById('balance-account');
  const textAccount = document.getElementById('text-account');
  const pageNumberEl = document
    .getElementById('page-number')
    .querySelector('p');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnNewDeposit = document.getElementById('btn-new-deposit');

  const userData = JSON.parse(localStorage.getItem('userData'));

  const notyf = new window.Notyf();

  let ahorroAccountData = null;
  let corrienteAccountData = null;
  let currentAccount = null;

  let currentPage = 1;
  let totalPages = 1;

  //Función para obtener las cuentas bancarias del usuarios
  const fetchAccounts = async () => {
    document.getElementById('loader').style.display = 'block';
    document.getElementById('section-deposit').style.display = 'none';

    try {
      const res = await fetch(`/api/v1/account/currents/${userData.cc}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getCookie('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.status === 200) {
        ahorroAccountData = data.find((a) => a.account_type === 'Ahorros');
        corrienteAccountData = data.find((a) => a.account_type === 'Corriente');

        const lastFourDigits = ahorroAccountData.account_number.slice(-4);

        selectAccount.innerHTML = '';

        const addedAccounts = new Set();

        data.forEach((account) => {
          if (!addedAccounts.has(account.account_number)) {
            addedAccounts.add(account.account_number);

            const option = document.createElement('option');
            option.value = account.account_number;
            option.textContent = account.account_type;

            if (account.account_type.toLowerCase() === 'ahorros') {
              option.selected = true;
            }

            selectAccount.appendChild(option);
          }
        });

        textAccount.textContent = 'Cuenta de Ahorros';

        last4Digits.textContent = lastFourDigits;

        balanceAccount.textContent = parseFloat(
          ahorroAccountData.balance
        ).toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
        });

        animateNumber(balanceAccount, 0, ahorroAccountData.balance, 600);

        fetchDeposits(ahorroAccountData.account_number);
      }
    } catch (error) {
      console.error(
        `Error al obtener las cuentas bancarias del usuario ${
          userData.first_name.split(' ')[0]
        }:`,
        error.message
      );
    } finally {
      document.getElementById('loader').style.display = 'none';
      document.getElementById('section-deposit').style.display = 'block';
    }
  };

  // Función para obtener los depositos de la cuenta seleccionada
  const fetchDeposits = async (account, page = 1) => {
    document.getElementById('loader').style.display = 'block';
    document.getElementById('section-deposit').style.display = 'none';

    currentAccount = account;

    try {
      const res = await fetch(
        `/api/v1/deposit/${account}?page=${page}&limit=5`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${getCookie('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await res.json();

      if (res.status === 200) {
        const recentDeposits = data.deposits
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((t) => ({
            ...t,
            amount: `+${parseFloat(t.amount).toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
            })}`,
            date: new Date(t.date).toLocaleString('es-CO', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'America/Bogota',
            }),
          }));

        $(document).ready(function () {
          let tabla;
          if (!$.fn.DataTable.isDataTable('#table-deposit')) {
            tabla = $('#table-deposit').DataTable({
              paging: false,
              searching: false,
              info: false,
              responsive: true,
              order: [[2, 'desc']],
              language: {
                emptyTable: 'No se encontraron depósitos registrados.',
              },
            });
          } else {
            tabla = $('#table-deposit').DataTable();
            tabla.clear().draw();
          }

          recentDeposits.forEach((t) => {
            const rowNode = tabla.row
              .add([t.amount, t.state, t.date])
              .draw()
              .node();

            $(rowNode).css('background-color', 'rgba(0, 128, 0, 0.1)');
          });
        });

        totalPages = Math.ceil(data.pagination.total / data.pagination.limit);

        updatePaginationControls();
      }
    } catch (error) {
      console.error('Error al obtener los depositos: ', error.message);
    } finally {
      document.getElementById('loader').style.display = 'none';
      document.getElementById('section-deposit').style.display = 'block';
    }
  };

  const handleDeposit = async (amount, modalContainer) => {
    document
      .querySelectorAll('#form-deposit input, #form-deposit button')
      .forEach((el) => (el.disabled = true));

    try {
      const res = await fetch(`/api/v1/deposit/${selectAccount.value}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getCookie('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
        }),
      });

      const message = await res.json();

      if (res.status === 200) {
        fetchAccounts();
        notyf.success(message);
        modalContainer.remove();
      } else {
        notyf.error(message);
      }
    } catch (error) {
      console.error('Error al realizar el depósito:', error);
    } finally {
      document
        .querySelectorAll('#form-deposit input, #form-deposit button')
        .forEach((el) => (el.disabled = false));
    }
  };

  // Función para actualizar los controles de paginación
  const updatePaginationControls = async () => {
    pageNumberEl.textContent = currentPage;

    if (currentPage <= 1) {
      btnPrev.classList.add('opacity-50', 'pointer-events-none');
    } else {
      btnPrev.classList.remove('opacity-50', 'pointer-events-none');
    }

    if (currentPage >= totalPages) {
      btnNext.classList.add('opacity-50', 'pointer-events-none');
    } else {
      btnNext.classList.remove('opacity-50', 'pointer-events-none');
    }
  };

  selectAccount.addEventListener('change', (e) => {
    const accountNumber = e.target.value;

    const accountData =
      accountNumber === corrienteAccountData.account_number
        ? corrienteAccountData
        : accountNumber === ahorroAccountData.account_number
        ? ahorroAccountData
        : null;

    const lastFourDigits = accountData.account_number.slice(-4);

    textAccount.textContent =
      accountData.account_type.toLowerCase() === 'ahorros'
        ? `Cuenta de Ahorros`
        : 'Cuenta Corriente';

    last4Digits.textContent = lastFourDigits;

    balanceAccount.textContent = parseFloat(accountData.balance).toLocaleString(
      'es-CO',
      {
        style: 'currency',
        currency: 'COP',
      }
    );

    animateNumber(balanceAccount, 0, accountData.balance, 600);

    fetchDeposits(accountNumber);
  });

  btnPrev.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchDeposits(currentAccount, currentPage);
    }
  });

  btnNext.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchDeposits(currentAccount, currentPage);
    }
  });

  // Evento para mostrar el modal de realizar deposito
  btnNewDeposit.addEventListener('click', () => {
    btnNewDeposit.blur();

    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-deposit';
    modalContainer.className =
      'absolute inset-0 flex justify-center items-center z-[100] bg-black/60 transition-opacity duration-300 opacity-0';
    modalContainer.innerHTML = `
      <form id="form-deposit" class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg scale-95 transition-transform duration-300">
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-2">
          ¡Hora de hacer tu depósito!
        </h2>
        <p class="text-gray-600 text-center mb-4">
          Indica la cantidad que deseas depositar en tu cuenta. Es rápido, seguro
          y estará disponible al instante.
        </p>

        <div class="flex justify-center mb-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="Depósito"
            class="w-24 h-24"
          />
        </div>

        <div class="mb-6">
          <label
            for="depositAmount"
            class="block text-gray-700 font-semibold mb-2 text-center"
          >
            ¿Cuánto deseas depositar?
          </label>
          <input
            type="number"
            id="depositAmount"
            min="1"
            step="0.01"
            placeholder="Ej: 50000"
            class="mx-auto block w-40 text-center border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div class="bg-green-50 p-4 rounded-lg text-green-700 text-sm mb-6">
          <p>✔ Tu depósito se acreditará inmediatamente</p>
          <p>✔ Recibirás una notificación por correo</p>
          <p>✔ Transacción segura y protegida</p>
        </div>

        <div class="flex justify-center space-x-4">
          <button type="submit" id="confirmDepositBtn" class="btn">
            <div class="loader_button"></div>
            <span>Confirmar depósito</span>
          </button>
          <button id="cancelDepositBtn" class="btn bg-red-500 hover:bg-red-600">
            Cancelar
          </button>
        </div>

        <p class="text-gray-400 text-xs text-center mt-4">
          Tus datos están protegidos con encriptación bancaria de nivel avanzado.
        </p>
      </form>
    `;

    document.getElementById('body-layout').appendChild(modalContainer);

    const form = modalContainer.querySelector('#form-deposit');
    const amount = modalContainer.querySelector('#depositAmount');

    // Animación de entrada
    setTimeout(() => {
      modalContainer.classList.remove('opacity-0');
      modalContainer.classList.add('opacity-100');
      form.classList.remove('scale-95');
      form.classList.add('scale-100');
    }, 10);

    // Evento para cerrar el modal
    document
      .getElementById('cancelDepositBtn')
      .addEventListener('click', () => {
        amount.value = '';
        modalContainer.classList.remove('opacity-100');
        modalContainer.classList.add('opacity-0');

        setTimeout(() => {
          document.getElementById('body-layout').removeChild(modalContainer);
        }, 10);
      });

    validateDeposit(form, handleDeposit, { amount, modalContainer });
  });

  fetchAccounts();
});
