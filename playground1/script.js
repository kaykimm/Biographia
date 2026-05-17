const input = document.getElementById("text-input");
const output = document.getElementById("letter-output");
const grid = document.getElementById("alphabet-grid");

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

function renderLetters() {
  const value = input.value.toLowerCase().slice(0, 10);

  input.value = value;
  output.innerHTML = "";

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
  alphabet.forEach((letter, index) => {
    const card = document.createElement("div");
    card.className = "letter-card";

    card.innerHTML = `
      <img src="./letters/${letter}.jpg" alt="${letter}">
      <div class="letter-info">
        <span>${letter}</span>
        <span>Letter ${String(index + 1).padStart(2, "0")}</span>
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