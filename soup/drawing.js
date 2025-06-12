document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('myCanvas');
  const context = canvas.getContext('2d');

  let isDrawing = false;

  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    draw(e);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
      draw(e);
    }
  });

  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    context.beginPath();
  });

  function draw(e) {
    const x = e.clientX - canvas.offsetLeft;
    const y = e.clientY - canvas.offsetTop;

    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = '#000';

    if (!isDrawing) {
      context.beginPath();
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
      context.stroke();
    }
  }
});
