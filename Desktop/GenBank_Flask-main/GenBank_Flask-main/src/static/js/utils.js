// Función para animar un número desde un valor inicial hasta un valor final
export const animateNumber = (element, start, end, duration) => {
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
