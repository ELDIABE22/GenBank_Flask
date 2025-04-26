import { getCookie } from './token.js';

document.addEventListener('DOMContentLoaded', () => {
  const newAccountBtn = document.getElementById('new-account');
  const savingsAccount = document.getElementById('savings-account');
  const currentAccount = document.getElementById('current-account');
  const showCardDataAhorro = document.getElementById('show-card-data-ahorro');
  const hideCardDataAhorro = document.getElementById('hide-card-data-ahorro');
  const showCardDataCorriente = document.getElementById('show-card-data-corriente');
  const hideCardDataCorriente = document.getElementById('hide-card-data-corriente');

  const balance = document.getElementById('balance');

  const ctx = document.getElementById('doughnutChart').getContext('2d');

  const userData = JSON.parse(localStorage.getItem('userData'));

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
        savingsAccountData = data.find(
          (a) => a.account_type === 'Ahorros'
        );

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
        const lastFourDigitsSavings = savingsAccountData.account_number.slice(-4);

        const formattedCurrentBalance = parseFloat(
          currentAccountData.balance
        ).toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
        });
        const lastFourDigitsCurrent = currentAccountData.account_number.slice(-4);

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

      new Chart(ctx, {
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
      console.log(
        `Error al obtener las cuentas bancarias del usuario ${
          userData.first_name.split(' ')[0]
        }`,
        error
      );
    } finally {
      document.getElementById('loader').style.display = 'none';
      document.getElementById('section-dashboard').style.display = 'flex';
    }
  };

  // Función para obtener las últimas 5 transacciones del usuario
  const fetchTransaction = async (account) => {
    try {
      const res = await fetch(`/api/v1/transaction/${account}/transactions`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getCookie('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();

      const recentTransactions = data
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
      });
    } catch (error) {
      console.log(
        `Error al obtener las ultimas transacciones del usuario ${
          userData.first_name.split(' ')[0]
        }`
      );
    }
  };

  savingsAccount.addEventListener('click', () =>
    toggleZIndex(savingsAccount, currentAccount)
  );
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

// Función para animar un número desde un valor inicial hasta un valor final
const animateNumber = (element, start, end, duration) => {
  let startTime = null;

  function updateNumber(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const currentNumber = Math.floor(progress * (end - start) + start);
    element.textContent = `${currentNumber.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
    })}`;

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }

  requestAnimationFrame(updateNumber);
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
