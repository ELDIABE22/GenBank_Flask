import { getCookie } from './token.js';
import { animateNumber } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const newAccountBtn = document.getElementById('new-account');
  const savingsAccount = document.getElementById('savings-account');
  const currentAccount = document.getElementById('current-account');
  const showCardDataAhorro = document.getElementById('show-card-data-ahorro');
  const hideCardDataAhorro = document.getElementById('hide-card-data-ahorro');
  const showCardDataCorriente = document.getElementById(
    'show-card-data-corriente'
  );
  const hideCardDataCorriente = document.getElementById(
    'hide-card-data-corriente'
  );

  let chartInstance = null;

  const balance = document.getElementById('balance');

  const ctx = document.getElementById('doughnutChart').getContext('2d');

  const userData = JSON.parse(localStorage.getItem('userData'));

  const notyf = new window.Notyf();

  let savingsAccountData;
  let currentAccountData;

  // Nombres del perfil
  document.getElementById('user-name-profile').textContent =
    userData.first_name + ' ' + userData.last_name.split(' ')[0];

  // CC del perfil
  document.getElementById('user-cc-profile').textContent = userData.cc;

  // Primer nombre de bienvenida
  document.getElementById('welcome-name').textContent =
    userData.first_name.split(' ')[0];

  // Función para obtener cuentas del usuario
  const fetchAccounts = async () => {
    document.getElementById('loader').style.display = 'block';
    document.getElementById('section-dashboard').style.display = 'none';

    try {
      const res = await fetch(`/api/v1/account/currents/${userData.cc}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getCookie('token')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (data.length > 1) {
        newAccountBtn.classList.toggle('hidden');
      }

      const balanceAccounts = data.reduce(
        (a, b) => a + parseFloat(b.balance),
        0
      );

      // Número de cuentas bancarias
      document.getElementById('bank-accounts-number').textContent =
        data.length > 1
          ? `${data.length} Cuentas Bancarias`
          : `${data.length} Cuenta Bancaria`;

      animateNumber(balance, 0, balanceAccounts, 1200);

      // Datos de las tarjetas
      if (data.length === 1) {
        savingsAccountData = data.find((a) => a.account_type === 'Ahorros');

        const formattedBalance = parseFloat(
          savingsAccountData.balance
        ).toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
        });
        const lastFourDigits = savingsAccountData.account_number.slice(-4);

        document.getElementById('balance-ahorro').textContent =
          formattedBalance;
        document.getElementById('account-type-ahorro').textContent =
          savingsAccountData.account_type;
        document.getElementById('account-number-4-digits-ahorro').textContent =
          lastFourDigits;
      } else if (data.length > 1) {
        currentAccount.classList.replace('hidden', 'block');

        savingsAccountData = data.find((a) => a.account_type === 'Ahorros');
        currentAccountData = data.find((a) => a.account_type === 'Corriente');

        const formattedSavingsBalance = parseFloat(
          savingsAccountData.balance
        ).toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
        });
        const lastFourDigitsSavings =
          savingsAccountData.account_number.slice(-4);

        const formattedCurrentBalance = parseFloat(
          currentAccountData.balance
        ).toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
        });
        const lastFourDigitsCurrent =
          currentAccountData.account_number.slice(-4);

        document.getElementById('balance-ahorro').textContent =
          formattedSavingsBalance;
        document.getElementById('account-type-ahorro').textContent =
          savingsAccountData.account_type;
        document.getElementById('account-number-4-digits-ahorro').textContent =
          lastFourDigitsSavings;

        document.getElementById('balance-corriente').textContent =
          formattedCurrentBalance;
        document.getElementById('account-type-corriente').textContent =
          currentAccountData.account_type;
        document.getElementById(
          'account-number-4-digits-corriente'
        ).textContent = lastFourDigitsCurrent;
      }

      // Gráfico del saldo de las cuentas
      const chartData = {
        labels: ['Ahorro', 'Corriente'],
        datasets: [
          {
            label: 'Saldo',
            data: data.map((a) => parseFloat(a.balance)),
            backgroundColor: ['#0047a3', '#3a1f54'],
          },
        ],
      };

      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
          cutout: '60%',
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });

      fetchTransaction(data[0].account_number);
    } catch (error) {
      console.error(
        `Error al obtener las cuentas bancarias del usuario ${
          userData.first_name.split(' ')[0]
        }`,
        error.message
      );
    } finally {
      document.getElementById('loader').style.display = 'none';
      document.getElementById('section-dashboard').style.display = 'flex';
    }
  };

  // Función para obtener las últimas 5 transacciones del usuario
  const fetchTransaction = async (account) => {
    try {
      const res = await fetch(
        `/api/v1/transaction/${account}/transactions?&limit=5`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${getCookie('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await res.json();

      const recentTransactions = data.transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .map((t) => ({
          ...t,
          amount:
            t.type === 'Gasto'
              ? `-${parseFloat(t.amount).toLocaleString('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                })}`
              : `+${parseFloat(t.amount).toLocaleString('es-CO', {
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
        if (!$.fn.DataTable.isDataTable('#table-transaction')) {
          const tabla = $('#table-transaction').DataTable({
            paging: false,
            searching: false,
            info: false,
            responsive: true,
          });

          recentTransactions.forEach((t) => {
            const rowNode = tabla.row
              .add([
                t.type === 'Gasto' ? t.account : t.related_account,
                t.type === 'Gasto' ? t.related_account : t.account,
                t.amount,
                t.state,
                t.date,
              ])
              .draw()
              .node();

            if (t.type === 'Gasto') {
              $(rowNode).css('background-color', 'rgba(255, 0, 0, 0.15)');
            } else {
              $(rowNode).css('background-color', 'rgba(0, 128, 0, 0.1)');
            }
          });
        }
      });
    } catch (error) {
      console.log(
        `Error al obtener las ultimas transacciones del usuario ${
          userData.first_name.split(' ')[0]
        }`
      );
    }
  };

  // Función para cambiar el índice z de dos elementos de tarjeta para traer uno al frente
  const toggleZIndex = (cardToShow, cardToHide) => {
    if (cardToShow.classList.contains('z-10')) {
      return;
    } else {
      cardToShow.classList.remove('z-0');
      cardToShow.classList.add('z-10');

      cardToHide.classList.remove('z-10');
      cardToHide.classList.add('z-0');
    }
  };

  // Evento para mostrar el modal de crear cuenta corriente
  newAccountBtn.addEventListener('click', () => {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modalAccountCorriente';
    modalContainer.className =
      'absolute inset-0 flex justify-center items-center z-[100] bg-black/60 transition-opacity duration-300 opacity-0';
    modalContainer.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg scale-95 transition-transform duration-300">
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-4">
          ¡Estás a un paso de crear tu cuenta corriente!
        </h2>
        <p class="text-gray-600 text-sm text-center mb-6">
          Con tu nueva cuenta, podrás gestionar tu dinero de forma
          segura y disfrutar de la libertad de ahorrar a tu ritmo.
        </p>
        <ul class="text-gray-600 mb-6 space-y-2">
          <li>
            ✔ Aceptas nuestros
            <a href="#" class="text-blue-600 hover:underline"
              >Términos y Condiciones</a
            >
            y
            <a href="#" class="text-blue-600 hover:underline"
              >Política de Privacidad</a
            >.
          </li>
          <li>✔ Confirmas que proporcionarás información veraz y actualizada.</li>
          <li>
            ✔ Entiendes que esta cuenta está sujeta a regulaciones bancarias
            locales.
          </li>
        </ul>
        <label class="flex items-center mb-6">
          <input
            type="checkbox"
            id="termsCheckbox"
            class="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            required
          />
          <span class="ml-2 text-gray-600"
            >He leído y acepto los términos y condiciones.</span
          >
        </label>
        <div class="flex justify-center space-x-4">
          <button id="createAccountBtn" class="btn" disabled>Crear mi cuenta</button>
          <button id="closeModal" class="btn bg-red-500 hover:bg-red-600">Cancelar</button>
        </div>
        <p class="text-gray-500 text-xs text-center mt-4">
          Tu información está protegida con los más altos estándares de seguridad.
        </p>
      </div>
    `;

    document.getElementById('body-layout').appendChild(modalContainer);

    const termsCheckbox = modalContainer.querySelector('#termsCheckbox');
    const createAccountBtn = modalContainer.querySelector('#createAccountBtn');

    // Animación de entrada
    setTimeout(() => {
      modalContainer.classList.remove('opacity-0');
      modalContainer.classList.add('opacity-100');
    }, 10);

    // Evento para habilitar el botón de crear cuenta
    termsCheckbox.addEventListener('change', (e) => {
      createAccountBtn.disabled = !e.target.checked;
    });

    // Evento para cerrar el modal
    document.getElementById('closeModal').addEventListener('click', () => {
      modalContainer.classList.remove('opacity-100');
      modalContainer.classList.add('opacity-0');

      setTimeout(() => {
        document.getElementById('body-layout').removeChild(modalContainer);
      }, 10);
    });

    // Evento para crear la cuenta
    createAccountBtn.addEventListener('click', async () => {
      if (!createAccountBtn.disabled) {
        termsCheckbox.disabled = true;
        createAccountBtn.disabled = true;
        document.getElementById('closeModal').disabled = true;

        try {
          const res = await fetch('/api/v1/account/current', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${getCookie('token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cc: userData.cc,
            }),
          });

          const result = await res.json();

          if (res.status === 201) {
            fetchAccounts();
            notyf.success(result.message);
            modalContainer.remove();
          } else {
            notyf.error(result.message);
            termsCheckbox.disabled = false;
            createAccountBtn.disabled = false;
            document.getElementById('closeModal').disabled = false;
          }
        } catch (error) {
          console.error('Error al crear cuenta corriente:', error);
        } finally {
          termsCheckbox.disabled = false;
          createAccountBtn.disabled = false;
        }
      }
    });
  });

  // Evento para poner tarjeta de ahorros en el frente
  savingsAccount.addEventListener('click', () =>
    toggleZIndex(savingsAccount, currentAccount)
  );

  // Evento para poner tarjeta corriente en el frente
  currentAccount.addEventListener('click', () =>
    toggleZIndex(currentAccount, savingsAccount)
  );

  // Evento para mostrar los datos de la tarjeta de ahorros
  showCardDataAhorro.addEventListener('click', () => {
    showCardDataAhorro.classList.toggle('hidden');
    hideCardDataAhorro.classList.replace('hidden', 'block');

    const formattedSavingsAccountNumber =
      savingsAccountData.account_number.replace(/(\d{4})(?=\d)/g, '$1 ');

    document.getElementById('expirate-ahorro').textContent =
      savingsAccountData.expiration_date;
    document.getElementById('account-number-ahorro').textContent =
      formattedSavingsAccountNumber;
  });

  // Evento para ocultar los datos de la tarjeta de ahorros
  hideCardDataAhorro.addEventListener('click', () => {
    hideCardDataAhorro.classList.replace('block', 'hidden');
    showCardDataAhorro.classList.replace('hidden', 'block');

    const lastFourDigits = savingsAccountData.account_number.slice(-4);

    document.getElementById('account-number-ahorro').innerHTML = `
        ●●●● ●●●● ●●●● 
        <span id="account-number-4-digits-ahorro" class="text-16">${lastFourDigits}</span>
      `;

    document.getElementById('expirate-ahorro').textContent = '●● / ●●';
  });

  // Evento para mostrar los datos de la tarjeta corriente
  showCardDataCorriente.addEventListener('click', () => {
    showCardDataCorriente.classList.toggle('hidden');
    hideCardDataCorriente.classList.replace('hidden', 'block');

    const formattedCurrentAccountNumber =
      currentAccountData.account_number.replace(/(\d{4})(?=\d)/g, '$1 ');

    document.getElementById('expirate-corriente').textContent =
      currentAccountData.expiration_date;
    document.getElementById('account-number-corriente').textContent =
      formattedCurrentAccountNumber;
  });

  // Evento para ocultar los datos de la tarjeta corriente
  hideCardDataCorriente.addEventListener('click', () => {
    hideCardDataCorriente.classList.replace('block', 'hidden');
    showCardDataCorriente.classList.replace('hidden', 'block');

    const lastFourDigits = currentAccountData.account_number.slice(-4);

    document.getElementById('account-number-corriente').innerHTML = `
        ●●●● ●●●● ●●●● 
        <span id="account-number-4-digits-corriente" class="text-16">${lastFourDigits}</span>
      `;

    document.getElementById('expirate-corriente').textContent = '●● / ●●';
  });

  fetchAccounts();
});
