let darkmode = localStorage.getItem("darkmode");
const themeSwitch = document.getElementById("theme-switch");
const clickAudio = new Audio("assets/sounds/mixkit-cool-interface-click-tone-2568.wav");
clickAudio.preload = "auto";
const logo = document.querySelector("#logo");

const enableDarkmode = () => {
    document.body.classList.add("darkmode");
    localStorage.setItem("darkmode", "active");
    darkmode = "active";
    if (themeSwitch) themeSwitch.textContent = "☀️";
    if (logo) logo.src = "assets/logo/logo-darkmode.png";

};

const disableDarkmode = () => {
    document.body.classList.remove("darkmode");
    localStorage.removeItem("darkmode");
    darkmode = null;
    if (themeSwitch) themeSwitch.textContent = "🌙";
    if (logo) logo.src = "assets/logo/logo-lightmode.png";

};
const playClickSound = () => {
    try {
        clickAudio.currentTime = 0;
        clickAudio.play().catch(() => { });
    } catch (e) {
        console.error("Error playing click sound:", e);
    }
}
if (darkmode === "active") enableDarkmode();
if (themeSwitch) {
    themeSwitch.addEventListener("click", () => {
        const willEnable = darkmode !== "active";
        willEnable ? enableDarkmode() : disableDarkmode();
        // play click sound only when user clicks the switch
        playClickSound();
    });
}
