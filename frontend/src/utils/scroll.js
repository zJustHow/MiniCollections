export function scrollAppToTop() {
  const main = document.getElementById("main-content");
  if (main) {
    main.scrollTop = 0;
  }
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
