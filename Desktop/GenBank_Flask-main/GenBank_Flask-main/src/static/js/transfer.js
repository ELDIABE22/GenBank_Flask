import { getCookie } from './token.js';
import { validateTransfer } from './validations.js';

document.addEventListener('DOMContentLoaded', () => {
  const fromAccount = document.getElementById('from_account');
  const toAccount = document.getElementById('to_account');
  const amount = document.getElementById('amount');
  const form = document.getElementById('form_transfer');
  const btnTransfer = document.getElementById('btn_transfer');

  const userData = JSON.parse(localStorage.getItem('userData'));

  const notyf = new window.Notyf();

  //Función para obtener las cuentas bancarias del usuarioqs
  const fetchAccounts = async () => {
    document.getElementById('loader').style.display = 'block';
    document.getElementById('section-transfer').style.display = 'none';

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
        data.forEach((account) => {
          const option = document.createElement('option');
          option.value = account.account_number;
          option.textContent = `${account.account_number} - ${
            account.account_type
          } - ${parseFloat(account.balance).toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
          })}`;
          fromAccount.appendChild(option);
        });
      }
    } catch (error) {
      console.error(
        `Error al obtener las cuentas bancarias del usuario ${
          userData.first_name.split(' ')[0]
        }`,
        error.message
      );
    } finally {
      document.getElementById('loader').style.display = 'none';
      document.getElementById('section-transfer').style.display = 'block';
    }
  };

  //Función para hacer la transferencia
  const handleTransfer = async () => {
    document
      .querySelectorAll(
        '#form_transfer input, #form_transfer textarea, #form_transfer select, #form_transfer button'
      )
      .forEach((el) => (el.disabled = true));
    btnTransfer.classList.add('loading');

    try {
      const res = await fetch('/api/v1/transaction', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getCookie('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_account: fromAccount.value,
          to_account: toAccount.value,
          amount: parseFloat(amount.value),
        }),
      });

      const message = await res.json();

      if (res.status === 200) {
        fetchAccounts();
        notyf.success(message);

        form.reset();

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 200);
      } else {
        notyf.error(message);
      }
    } catch (error) {
      console.error('Error al hacer la transferencia: ', error.message);
    } finally {
      btnTransfer.classList.remove('loading');
      document
        .querySelectorAll(
          '#form_transfer input, #form_transfer textarea, #form_transfer select, #form_transfer button'
        )
        .forEach((el) => (el.disabled = false));
    }
  };

  // Validar campos del formulario y hacer el submit
  validateTransfer(form, handleTransfer, {
    fromAccount,
    toAccount,
    amount,
  });

  fetchAccounts();
});
