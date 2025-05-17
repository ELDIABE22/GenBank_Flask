import { getCookie } from './token.js';
import { animateNumber } from './utils.js';

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

  const userData = JSON.parse(localStorage.getItem('userData'));

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

        data.forEach((account) => {
          const option = document.createElement('option');
          option.value = account.account_number;
          option.textContent = account.account_type;

          if (account.account_type.toLowerCase() === 'ahorros') {
            option.selected = true;
          }

          selectAccount.appendChild(option);
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

  fetchAccounts();
});
