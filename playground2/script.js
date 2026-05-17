const uploadInput = document.getElementById("image-upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const controls = {
  threshold: document.getElementById("threshold"),
  contrast: document.getElementById("contrast"),
  grain: document.getElementById("grain"),
  distort: document.getElementById("distort"),
  dots: document.getElementById("dots"),
  dither: document.getElementById("dither"),
  edge: document.getElementById("edge"),
  pixel: document.getElementById("pixel"),
  blur: document.getElementById("blur"),
  invert: document.getElementById("invert")
};

const resetButton = document.getElementById("reset-button");
const exportButton = document.getElementById("export-button");
const sampleCards = document.querySelectorAll(".sample-card");

let originalImage = null;

function loadImageFromFile(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
    loadImageFromSrc(event.target.result);
  };

  reader.readAsDataURL(file);
}

function loadImageFromSrc(src) {
  const img = new Image();

  img.onload = function () {
    originalImage = img;
    drawImage();
  };

  img.src = src;
}

function fitCanvasToImage(img) {
  const maxSize = 1100;
  const ratio = img.width / img.height;

  if (ratio >= 1) {
    canvas.width = maxSize;
    canvas.height = Math.round(maxSize / ratio);
  } else {
    canvas.height = maxSize;
    canvas.width = Math.round(maxSize * ratio);
  }
}

function drawImage() {
  if (!originalImage) {
    drawPlaceholder();
    return;
  }

  fitCanvasToImage(originalImage);

  const blurAmount = Number(controls.blur.value);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.filter = blurAmount > 0 ? `blur(${blurAmount}px)` : "none";
  ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
  ctx.filter = "none";

  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  imageData = applyContrast(imageData, Number(controls.contrast.value));
  imageData = applyThreshold(imageData, Number(controls.threshold.value));
  imageData = applyDither(imageData, Number(controls.dither.value));
  imageData = applyGrain(imageData, Number(controls.grain.value));

  if (controls.invert.checked) {
    imageData = applyInvert(imageData);
  }

  ctx.putImageData(imageData, 0, 0);

  applyEdge(Number(controls.edge.value));
  applyPixel(Number(controls.pixel.value));
  applyDots(Number(controls.dots.value));
  applyDistort(Number(controls.distort.value));
}

function applyContrast(imageData, amount) {
  const data = imageData.data;
  const factor = (259 * (amount * 2.55 + 255)) / (255 * (259 - amount * 2.55));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128);
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
  }

  return imageData;
}

function applyThreshold(imageData, threshold) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const color = gray > threshold ? 255 : 0;

    data[i] = color;
    data[i + 1] = color;
    data[i + 2] = color;
  }

  return imageData;
}

function applyGrain(imageData, amount) {
  if (amount === 0) return imageData;

  const data = imageData.data;
  const strength = amount * 2.4;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * strength;

    data[i] = clamp(data[i] + noise);
    data[i + 1] = clamp(data[i + 1] + noise);
    data[i + 2] = clamp(data[i + 2] + noise);
  }

  return imageData;
}

function applyDither(imageData, amount) {
  if (amount === 0) return imageData;

  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const strength = amount / 100;

  const matrix = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const gray = data[i];
      const threshold = (matrix[y % 4][x % 4] / 16) * 255 * strength;
      const color = gray + threshold > 128 ? 255 : 0;

      data[i] = color;
      data[i + 1] = color;
      data[i + 2] = color;
    }
  }

  return imageData;
}

function applyInvert(imageData) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
  }

  return imageData;
}

function applyDots(amount) {
  if (amount === 0) return;

  const spacing = Math.max(4, 24 - amount / 4);
  const radiusBase = Math.max(1, amount / 14);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  ctx.fillStyle = "white";

  for (let y = 0; y < canvas.height; y += spacing) {
    for (let x = 0; x < canvas.width; x += spacing) {
      const i = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
      const brightness = data[i];

      if (brightness > 90) {
        const radius = radiusBase + (brightness / 255) * radiusBase;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function applyDistort(amount) {
  if (amount === 0) return;

  const source = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const output = ctx.createImageData(canvas.width, canvas.height);

  const src = source.data;
  const dst = output.data;
  const strength = amount / 5;

  for (let y = 0; y < canvas.height; y++) {
    const shift = Math.floor(Math.sin(y * 0.035) * strength);

    for (let x = 0; x < canvas.width; x++) {
      const sourceX = clampIndex(x + shift, canvas.width - 1);

      const sourceIndex = (y * canvas.width + sourceX) * 4;
      const targetIndex = (y * canvas.width + x) * 4;

      dst[targetIndex] = src[sourceIndex];
      dst[targetIndex + 1] = src[sourceIndex + 1];
      dst[targetIndex + 2] = src[sourceIndex + 2];
      dst[targetIndex + 3] = src[sourceIndex + 3];
    }
  }

  ctx.putImageData(output, 0, 0);
}

function applyEdge(amount) {
  if (amount === 0) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const src = imageData.data;
  const output = ctx.createImageData(canvas.width, canvas.height);
  const dst = output.data;

  const width = canvas.width;
  const height = canvas.height;
  const strength = amount / 100;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;

      const left = src[(y * width + (x - 1)) * 4];
      const right = src[(y * width + (x + 1)) * 4];
      const top = src[((y - 1) * width + x) * 4];
      const bottom = src[((y + 1) * width + x) * 4];

      const edge = Math.abs(right - left) + Math.abs(bottom - top);
      const value = clamp(edge * strength * 4);

      dst[i] = value;
      dst[i + 1] = value;
      dst[i + 2] = value;
      dst[i + 3] = 255;
    }
  }

  ctx.putImageData(output, 0, 0);
}

function applyPixel(amount) {
  if (amount === 0) return;

  const size = Math.floor(2 + amount / 8);

  const smallCanvas = document.createElement("canvas");
  const smallCtx = smallCanvas.getContext("2d");

  smallCanvas.width = Math.max(1, Math.floor(canvas.width / size));
  smallCanvas.height = Math.max(1, Math.floor(canvas.height / size));

  smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(smallCanvas, 0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
}

function drawPlaceholder() {
  canvas.width = 900;
  canvas.height = 650;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function resetControls() {
  controls.threshold.value = 128;
  controls.contrast.value = 50;
  controls.grain.value = 0;
  controls.distort.value = 0;
  controls.dots.value = 0;
  controls.dither.value = 0;
  controls.edge.value = 0;
  controls.pixel.value = 0;
  controls.blur.value = 0;
  controls.invert.checked = false;

  drawImage();
}

function downloadCanvas() {
  const link = document.createElement("a");
  link.download = "biographia-pattern.jpg";
  link.href = canvas.toDataURL("image/jpeg", 1.0);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function clamp(value) {
  return Math.max(0, Math.min(255, value));
}

function clampIndex(value, max) {
  return Math.max(0, Math.min(max, value));
}

uploadInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    loadImageFromFile(file);
  }
});

sampleCards.forEach((card) => {
  card.addEventListener("click", () => {
    const img = card.querySelector(".sample-image");

    if (img) {
      loadImageFromSrc(img.src);
    }
  });
});

Object.values(controls).forEach((control) => {
  if (control) {
    control.addEventListener("input", drawImage);
    control.addEventListener("change", drawImage);
  }
});

if (resetButton) {
  resetButton.addEventListener("click", resetControls);
}

if (exportButton) {
  exportButton.addEventListener("click", downloadCanvas);
}

drawPlaceholder();