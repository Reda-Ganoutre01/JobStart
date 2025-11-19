let darkmode = false;
const themeSwitch = document.getElementById("theme-switch");
const clickAudio = new Audio("assets/sounds/mixkit-cool-interface-click-tone-2568.wav");
clickAudio.preload = "auto";
const logo = document.getElementById("logo");
const enableDarkmode = () => {
    document.body.classList.add("darkmode");
    darkmode = true;
    if (themeSwitch) themeSwitch.textContent = "☀️";
    playClickSound();
    if (logo) logo.src = "assets/logo/logo-darkmode.png";

};

const disableDarkmode = () => {
    document.body.classList.remove("darkmode");
    darkmode = false;
    if (themeSwitch) themeSwitch.textContent = "🌙";
    playClickSound();
    if (logo) logo.src = "assets/logo/logo-lightmode.png";

};
const playClickSound=()=>{
    try {
        clickAudio.currentTime = 0;
        clickAudio.play().catch(() => {});
    } catch (e) {
        console.error("Error playing click sound:", e);
    }
}
if (themeSwitch) {
    themeSwitch.addEventListener("click", () => {
        darkmode ? disableDarkmode() : enableDarkmode();
    });
} else {
    console.warn("theme-switch element not found: sound toggle will not work");
}
