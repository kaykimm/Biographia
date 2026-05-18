const input = document.getElementById("text-input");
const output = document.getElementById("letter-output");
const grid = document.getElementById("alphabet-grid");

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

const descriptions = {
  a: "HACKBERRY GALLS",
  b: "MEXICAN CRAZYLACE",
  c: "LILIUM OVARY",
  d: "SKELETONIZED LEAF",
  e: "SALT CRYSTALS",
  f: "STIBNITE",
  g: "CATERPILLAR EGGS",
  h: "GLASS SPONGE",
  i: "PITTED XYLEM VESSELS",
  j: "BEACH PEA ROOTS",
  k: "FERN LEAFLET MATURE SPORANGIA",
  l: "JELLY FUNGUS",
  m: "DRIED SOIL",
  n: "COPPER",
  o: "PTERIDIUM AQUILINUM CELL",
  p: "JAPANESE CEDAR",
  q: "COCONUT FIBER",
  r: "PEACOCK FEATHER",
  s: "RADIOLARIA",
  t: "RASPBERRY FLOWER",
  u: "DIATOMS",
  v: "FLOWER STAMEN",
  w: "CHIROPTERA BONE",
  x: "RAINBOW WEEVIL",
  y: "CACTACEAE SPINE",
  z: "HONEYCOMB CORAL"
};

function renderLetters() {
  const value = input.value.toLowerCase().slice(0, 5);

  input.value = value;
  output.innerHTML = "";

  output.style.setProperty("--letter-count", value.length || 1);

  for (const char of value) {
    if (alphabet.includes(char)) {
      const img = document.createElement("img");

      img.src = `./letters/${char}.jpg`;
      img.alt = char;

      output.appendChild(img);
    }
  }
}

function createAlphabetGrid() {
  grid.innerHTML = "";

  alphabet.forEach((letter) => {

    const card = document.createElement("div");

    card.className = "letter-card";

    card.innerHTML = `
      <img src="./letters/${letter}.jpg" alt="${letter}">

      <div class="letter-info">
        <span>${letter}</span>
        <span>${descriptions[letter]}</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

input.addEventListener("input", renderLetters);

createAlphabetGrid();

const modal = document.getElementById("image-modal");
const modalImage = document.getElementById("modal-image");

document.addEventListener("click", (event) => {

  const card = event.target.closest(".letter-card");

  if (card) {

    const img = card.querySelector("img");

    modalImage.src = img.src;

    modal.classList.add("active");
  }
});

modal.addEventListener("click", () => {
  modal.classList.remove("active");
});

const saveButton = document.getElementById("save-button");

saveButton.addEventListener("click", async () => {
  const captureTarget = document.querySelector(".type-area");
  const textInput = document.getElementById("text-input");
  const underline = document.querySelector(".underline");
  const caption = document.getElementById("export-caption");

  caption.textContent = textInput.value.toUpperCase();

  textInput.style.display = "none";
  underline.style.display = "none";
  caption.style.display = "block";

  const canvas = await html2canvas(captureTarget, {
    backgroundColor: "#000000",
    scale: 3,
    useCORS: true
  });

  textInput.style.display = "block";
  underline.style.display = "block";
  caption.style.display = "none";

  const link = document.createElement("a");
  link.download = "biographia-type.jpg";
  link.href = canvas.toDataURL("image/jpeg", 1.0);
  link.click();
});