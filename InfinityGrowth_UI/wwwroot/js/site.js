//const API_URL_BASE = 'https://infinitygrowthapi-c7d9apdseyh9ghfn.eastus-01.azurewebsites.net/';
const API_URL_BASE = "https://localhost:44378";

//change de logo when the the class dark is added to the body
const updateLogo = (theme) => {
    const logo = document.getElementById("primary-logo");
    const logoLogin = document.getElementById("primary-logo-login");
    const logoSidebar = document.getElementById("primary-logo-sideBar");
    if (theme === "dark") {
        logo.src = "/public/img/logo-png-dark.svg";
        if (logoLogin) {
            logoLogin.src = "/public/img/logo-png-dark.svg";
        }
        if (logoSidebar) {
            logoSidebar.src = "/public/img/logo-png-dark.svg";
        }
    } else {
        logo.src = "/public/img/logo-png-light.svg";
        if (logoLogin) {
            logoLogin.src = "/public/img/logo-png-light.svg";
        }
        if (logoSidebar) {
            logoSidebar.src = "/public/img/logo-png-light.svg";
        }
    }
}

// window.getThemeColors = function () {
//     const styles = getComputedStyle(document.documentElement);

//     return {
//         colorRed: styles.getPropertyValue("--negative-color").trim(),
//         colorGreen: styles.getPropertyValue("--positive-color").trim(),
//         fondoRed: styles.getPropertyValue("--bg-negative-color").trim(),
//         fondoGreen: styles.getPropertyValue("--bg-positive-color").trim(),
//         textColor: styles.getPropertyValue("--text-primary").trim()
//     };
// };
