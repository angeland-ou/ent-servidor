function getCookie(nombre) {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(nombre + "="))
        ?.split("=")[1];
}
const tema = getCookie("tema");

console.log(document.cookie);

document.querySelectorAll(".tema a").forEach(el => {
el.classList.remove("selected");
});

if (tema === "dark") {
    const element = document.querySelectorAll(".tema a:has(.modooscuro)").forEach(el => {
    el.classList.add("selected");
});
}
if (tema === "light") {
    const element = document.querySelectorAll(".tema a:has(.modoclaro)").forEach(el => {
    el.classList.add("selected");
});
}