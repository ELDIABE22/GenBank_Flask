document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('doughnutChart').getContext('2d');
  const balance = document.getElementById('balance');

  animateNumber(balance, 0, 1200698.12, 1200);

  $(document).ready(function () {
    const datos = [
      { id: 1, nombre: 'Juan', edad: 25 },
      { id: 2, nombre: 'María', edad: 30 },
      { id: 3, nombre: 'Carlos', edad: 22 },
    ];

    // Inicializar DataTables
    const tabla = $('#table-transaction').DataTable({
      paging: false,
      searching: false,
      info: false,
      responsive: true,
    });

    // Insertar datos en la tabla
    datos.forEach((persona) => {
      tabla.row.add([persona.id, persona.nombre, persona.edad]).draw();
    });
  });

  const data = {
    labels: ['Ahorro', 'Corriente'],
    datasets: [
      {
        label: 'Banks',
        data: [5000, 3200],
        backgroundColor: [
          '#0047a3',
          '#3a1f54',
        ],
      },
    ],
  };

  new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: {
      cutout: '60%',
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
});

function animateNumber(element, start, end, duration) {
  let startTime = null;

  function updateNumber(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const currentNumber = Math.floor(progress * (end - start) + start);
    element.textContent = `$${currentNumber.toLocaleString()}`;

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }

  requestAnimationFrame(updateNumber);
}
