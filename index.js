// Mock temperature data for the charts
const data = [
    [18, 19, 20, 21, 23], // January 21st
    [25, 26, 27, 29, 31], // January 22nd
    [19, 20, 20, 21, 22]  // January 23rd
  ];
  
  // Draw simple temperature line graphs
  data.forEach((temps, index) => {
    const canvas = document.getElementById(`chart${index + 1}`);
    const ctx = canvas.getContext("2d");
  
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - temps[0]);
  
    temps.forEach((temp, i) => {
      const x = (i / (temps.length - 1)) * canvas.width;
      const y = canvas.height - temp;
      ctx.lineTo(x, y);
    });
  
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  