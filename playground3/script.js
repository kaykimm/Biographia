const canvas = document.getElementById("drawing-canvas");
const ctx = canvas.getContext("2d");

const toolButtons = document.querySelectorAll(".tool");
const brushButtons = document.querySelectorAll(".brush");
const patternButtons = document.querySelectorAll(".pattern");

const resetButton = document.getElementById("reset-button");
const saveButton = document.getElementById("save-button");

const referenceUpload = document.getElementById("reference-upload");
const referenceWindow = document.getElementById("reference-window");
const referenceImage = document.getElementById("reference-image");
const closeReference = document.getElementById("close-reference");

let currentTool = "pen";
let brushSize = 2;
let currentPattern = "solid";

let isDrawing = false;
let lastX = 0;
let lastY = 0;

let startX = 0;
let startY = 0;
let savedCanvas = null;

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getPosition(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function setStrokeStyle() {
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

 if (currentTool === "eraser") {
  ctx.globalCompositeOperation = "destination-out";
  ctx.strokeStyle = "rgba(0,0,0,1)";
  ctx.fillStyle = "rgba(0,0,0,1)";
} else {
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "white";
  ctx.fillStyle = "white";
}
}

function drawPatternDot(x, y) {
  setStrokeStyle();

  if (currentPattern === "solid") {
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  }

  if (currentPattern === "dots") {
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(
        x + (Math.random() - 0.5) * brushSize * 5,
        y + (Math.random() - 0.5) * brushSize * 5,
        Math.max(1, brushSize / 2),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  if (currentPattern === "lines") {
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x - brushSize * 2, y + i * brushSize);
      ctx.lineTo(x + brushSize * 2, y + i * brushSize);
      ctx.stroke();
    }
  }

  if (currentPattern === "grid") {
    ctx.strokeRect(
      x - brushSize * 2,
      y - brushSize * 2,
      brushSize * 4,
      brushSize * 4
    );
  }
}

function startDrawing(event) {
  isDrawing = true;

  const pos = getPosition(event);

  lastX = pos.x;
  lastY = pos.y;

  startX = pos.x;
  startY = pos.y;

  savedCanvas = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (currentTool === "dot") {
    drawPatternDot(pos.x, pos.y);
  }
}

function draw(event) {
  if (!isDrawing) return;

  const pos = getPosition(event);

  setStrokeStyle();

  if (currentTool === "pen" || currentTool === "eraser") {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    if (currentTool === "pen" && currentPattern !== "solid") {
      drawPatternDot(pos.x, pos.y);
    }

    lastX = pos.x;
    lastY = pos.y;
  }

  if (currentTool === "line") {
    ctx.putImageData(savedCanvas, 0, 0);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  if (currentTool === "dot") {
    drawPatternDot(pos.x, pos.y);
  }
}

function stopDrawing() {
  isDrawing = false;
}

toolButtons.forEach((button) => {
  button.addEventListener("click", () => {
    toolButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    currentTool = button.dataset.tool;
  });
});

brushButtons.forEach((button) => {
  button.addEventListener("click", () => {
    brushButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    brushSize = Number(button.dataset.size);
  });
});

patternButtons.forEach((button) => {
  button.addEventListener("click", () => {
    patternButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    currentPattern = button.dataset.pattern;
  });
});

resetButton.addEventListener("click", () => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

saveButton.addEventListener("click", () => {
  const link = document.createElement("a");

  link.download = "biographia-drawing.jpg";
  link.href = canvas.toDataURL("image/jpeg", 1.0);
  link.click();
});

referenceUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    referenceImage.src = e.target.result;
    referenceWindow.classList.add("active");
  };

  reader.readAsDataURL(file);
});

closeReference.addEventListener("click", () => {
  referenceWindow.classList.remove("active");
});

let isDraggingReference = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

referenceWindow.addEventListener("mousedown", (event) => {
  if (event.target === closeReference) return;

  isDraggingReference = true;

  const rect = referenceWindow.getBoundingClientRect();

  dragOffsetX = event.clientX - rect.left;
  dragOffsetY = event.clientY - rect.top;
});

document.addEventListener("mousemove", (event) => {
  if (!isDraggingReference) return;

  const parentRect = referenceWindow.parentElement.getBoundingClientRect();

  referenceWindow.style.left = `${event.clientX - parentRect.left - dragOffsetX}px`;
  referenceWindow.style.top = `${event.clientY - parentRect.top - dragOffsetY}px`;
});

document.addEventListener("mouseup", () => {
  isDraggingReference = false;
});

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

window.addEventListener("resize", resizeCanvas);

resizeCanvas();