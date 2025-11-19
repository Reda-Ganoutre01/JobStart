 // Store darkmode state in memory (not localStorage)
        let darkmode = false;
        const themeSwitch = document.getElementById("theme-switch");

        const enableDarkmode = () => {
            document.body.classList.add("darkmode");
            darkmode = true;
            themeSwitch.textContent = "☀️";
        };

        const disableDarkmode = () => {
            document.body.classList.remove("darkmode");
            darkmode = false;
            themeSwitch.textContent = "🌙";
        };

        themeSwitch.addEventListener("click", () => {
            darkmode ? disableDarkmode() : enableDarkmode();
        });

// import logo from "../assets/logo/logo_jobstart_dark.png";
// let darkmode=localStorage.getItem("darkmode");
// const themeSwitch=document.getElementById("theme-switch");
// const logo=document.querySelector("#logo");

// const enableDarkmode=()=>{
//     document.body.classList.add("darkmode");
//     localStorage.setItem("darkmode","active");
//     logo.src=logo;

// }
// const disableDarkmode=()=>{
//     document.body.classList.remove("darkmode");
//     localStorage.setItem("darkmode",null);
// }

// if(darkmode==="active") enableDarkmode()

// themeSwitch.addEventListener("click",()=>{
//     darkmode=localStorage.getItem("darkmode");
//     darkmode !== "active" ? enableDarkmode():disableDarkmode();
// });