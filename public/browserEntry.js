// web.ts
var cookieName = "minesweeper";
var cookieMaxAge = 315360000000;

// browserEntry.ts
console.log("\uD83E\uDD70");
navigator.serviceWorker.addEventListener("message", (event) => {
  const { type, cookieName: cookieName2, cookieValue } = event.data;
  if (type !== "set-cookie")
    return;
  document.cookie = `${cookieName2}=${encodeURIComponent(JSON.stringify(cookieValue))};max-age=${cookieMaxAge}`;
});
