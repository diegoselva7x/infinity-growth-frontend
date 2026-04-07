document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const darkIconContainer = document.getElementById("dark-icon-container");
    const lightIconContainer = document.getElementById("light-icon-container");

    const currentTheme = localStorage.getItem("theme") || "light";
    document.documentElement.classList.toggle("light", currentTheme === "light");
    document.documentElement.classList.toggle("dark", currentTheme === "dark");

    const getCurrentTheme = () =>
        document.documentElement.classList.contains("light") ? "light" : "dark";

    updateLogo(getCurrentTheme());

    const updateIcons = (theme) => {
        darkIconContainer.classList.toggle("hidden", theme !== "dark");
        lightIconContainer.classList.toggle("hidden", theme !== "light");
    };

    updateIcons(getCurrentTheme());

    const applyTheme = (theme) => {
        document.documentElement.classList.toggle("light", theme === "light");
        document.documentElement.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
        updateLogo(theme);
        updateIcons(theme);

        // const themeChangeEvent = new CustomEvent("themeChanged", {
        //     detail: { theme }
        // });
        // document.dispatchEvent(themeChangeEvent);
    };

    themeToggleBtn?.addEventListener("click", () => {
        const newTheme = getCurrentTheme() === "light" ? "dark" : "light";
        applyTheme(newTheme);
    });
});