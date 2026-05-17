const audio = document.querySelector("#bg-audio");
const button = document.querySelector("#sound-toggle");

let isPlaying = false;

audio.volume = 0.5;

button.addEventListener("click", async function (event) {
  event.preventDefault();
  event.stopPropagation();

  if (isPlaying === false) {
    await audio.play();
    isPlaying = true;
    button.innerText = "SOUND OFF";
  } else {
    audio.pause();
    isPlaying = false;
    button.innerText = "SOUND ON";
  }
});