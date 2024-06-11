// utilities.ts
var randInt = (max) => Math.floor(Math.random() * max);
var randIntBetween = (min, max) => randInt(max - min) + min;

// game.ts
var DEFAULTS = {
  numRows: 10,
  numCols: 10,
  numMines: 5
};
var newGrid = ({ numRows, numCols, numMines }) => {
  const grid = Array(numRows).fill(1).map((_, y) => Array(numCols).fill(1).map((_2, x) => {
    return {
      type: "empty",
      touchingMines: 0,
      x,
      y
    };
  }));
  if (numMines > numRows * numCols)
    throw new Error("Can't have more mines than cells");
  for (var i = 0;i < numMines; i++) {
    let x, y;
    do {
      y = randIntBetween(0, numRows);
      x = randIntBetween(0, numCols);
    } while (grid[y][x].type === "mine");
    grid[y][x] = {
      type: "mine",
      x,
      y
    };
    for (let yOffset = -1;yOffset <= 1; yOffset++) {
      for (let xOffset = -1;xOffset <= 1; xOffset++) {
        if (yOffset == 0 && xOffset == 0)
          continue;
        const yActual = y + yOffset;
        const xActual = x + xOffset;
        if (yActual < 0 || yActual >= numRows || xActual < 0 || xActual >= numCols)
          continue;
        const cell = grid[yActual][xActual];
        if (cell.type !== "empty")
          continue;
        cell.touchingMines++;
      }
    }
  }
  return grid;
};
var select = (wholeState, selected) => {
  const selectedCell = wholeState.grid[selected.y][selected.x];
  const {
    settings: { numMines, numCols, numRows }
  } = wholeState;
  if (selectedCell.type === "mine") {
    wholeState.state = "gameOver";
    wholeState.grid.forEach((row) => row.forEach((cell) => cell.revealed = true));
  } else {
    const toRevealIfTouchingNone = [selectedCell];
    do {
      const current = toRevealIfTouchingNone.shift();
      if (!current || current.revealed || current.type !== "empty")
        continue;
      current.revealed = true;
      wholeState.numHidden--;
      if (current.touchingMines > 0)
        continue;
      if (current.x > 0)
        toRevealIfTouchingNone.push(wholeState.grid[current.y][current.x - 1]);
      if (current.x < numCols - 1)
        toRevealIfTouchingNone.push(wholeState.grid[current.y][current.x + 1]);
      if (current.y > 0)
        toRevealIfTouchingNone.push(wholeState.grid[current.y - 1][current.x]);
      if (current.y < numRows - 1)
        toRevealIfTouchingNone.push(wholeState.grid[current.y + 1][current.x]);
    } while (toRevealIfTouchingNone.length > 0);
  }
  if (wholeState.numHidden === numMines)
    wholeState.state = "gameWon";
};

// html.ts
var html = (templates, ...args) => String.raw(templates, ...args);
var MineCellContents = (_mine) => `\uD83D\uDCA3`;
var FlagCellContents = (_) => `\uD83C\uDFC1`;
var QuestionCellContents = (_) => `\u2753`;
var EmptyCellContents = ({ touchingMines }) => html`
    ${touchingMines === 0 ? "" : touchingMines}
`;
var MysteryCellContents = (cell) => html`
    <button
        type="submit"
        name="selected"
        value="${JSON.stringify(cell).replaceAll('"', "&quot;")}"
    ></button>
`;
var GridCell = (cell) => html`<div
        class="grid__cell grid__cell--${cell.type} grid__cell--${cell.revealed ? "revealed" : "hidden"}"
        data-grid-x="${cell.x}"
        data-grid-y="${cell.y}"
        data-revealed="${cell.revealed}"
        data-type="${cell.type}"
    >
        <input
            name="grid__cell"
            type="hidden"
            value="${JSON.stringify(cell).replaceAll('"', "&quot;")}"
        />
        ${!cell.revealed ? MysteryCellContents(cell) : cell.type === "empty" ? EmptyCellContents(cell) : cell.type === "flag" ? FlagCellContents(cell) : cell.type === "question" ? QuestionCellContents(cell) : MineCellContents(cell)}
    </div>`;
var GridRow = ({
  contents,
  row
}) => html`
    <fieldset class="grid__row">
        <legend>Row ${row}</legend>
        ${contents}
    </fieldset>
`;
var Grid = ({ contents }) => html`<form hx-post="/reveal.html" hx-swap="outerHTML" class="grid">
        ${contents}
    </form>`;
var GameOverMessage = () => html`
    <dialog open class="toast">Game Over :(</dialog>
`;
var GameWonMessage = () => html`
    <dialog open class="toast">Game Won :)</dialog>
`;
var GameState = ({
  contents,
  stateMessage
}) => contents + stateMessage;

// munge.ts
var queryToSettings = ({
  rows,
  cols,
  mines
}) => {
  const settings = { ...DEFAULTS };
  if (Number.isSafeInteger(Number(rows)))
    settings.numRows = Number(rows);
  if (Number.isSafeInteger(Number(cols)))
    settings.numCols = Number(cols);
  if (Number.isSafeInteger(Number(mines)))
    settings.numMines = Number(mines);
  return settings;
};
var cellListToGameState = (cells) => {
  const grid = [];
  let maxColumn = 0;
  let maxRow = 0;
  let numMines = 0;
  let numHidden = 0;
  cells.forEach((cell) => {
    const { y, x } = cell;
    if (!grid[y])
      grid[y] = [];
    grid[y][x] = cell;
    maxColumn = Math.max(maxColumn, x);
    maxRow = Math.max(maxRow, y);
    if (cell.type === "mine")
      numMines++;
    if (!cell.revealed)
      numHidden++;
  });
  const numCols = maxColumn + 1;
  const numRows = maxRow + 1;
  let state = "playing";
  if (numHidden === 0)
    state = "gameOver";
  if (numHidden === numMines)
    state = "gameWon";
  return {
    grid,
    settings: {
      numRows,
      numCols,
      numMines
    },
    numHidden,
    state
  };
};
var gridToHtml = (grid) => Grid({
  contents: grid.map((row, index) => GridRow({
    contents: row.map((cell) => GridCell(cell)).join(""),
    row: index
  })).join("")
});
var gameStateToHtml = (state) => state === "gameOver" ? GameOverMessage() : state === "gameWon" ? GameWonMessage() : "";

// web.ts
var cookieName = "minesweeper";
var cookieMaxAge = 315360000000;

// service-worker.ts
var serviceWorkerSelf = self;
var CACHE_NAME = "minesweeper-service-worker-cache-v1";
var deleteOldCaches = async () => {
  const cacheKeepList = [CACHE_NAME];
  const keyList = await caches.keys();
  const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
  await Promise.all(cachesToDelete.map((key) => caches.delete(key)));
};
var putInCache = async (request, response) => {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);
};
var cacheFirst = async (request) => {
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }
  const responseFromNetwork = await fetch(request);
  putInCache(request, responseFromNetwork.clone());
  return responseFromNetwork;
};
serviceWorkerSelf.addEventListener("install", async function(event) {
  console.log(`Service worker installed. Initiating cache ${CACHE_NAME}`, event);
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
    return cache.addAll([
      "favicon.ico",
      "android-chrome-192x192.png",
      "android-chrome-512x512.png",
      "apple-touch-icon.png",
      "favicon-16x16.png",
      "favicon-32x32.png",
      "site.webmanifest",
      "site.css"
    ]);
  }));
  serviceWorkerSelf.skipWaiting();
});
serviceWorkerSelf.addEventListener("activate", function(event) {
  console.log("Service worker activated", event);
  console.log("Service worker cleaning up old caches");
  event.waitUntil(deleteOldCaches());
  event.waitUntil((async () => {
    if (serviceWorkerSelf.registration.navigationPreload) {
      await serviceWorkerSelf.registration.navigationPreload.enable();
      console.log("Service worker enabled navigation preload");
    }
  })());
  console.log("Service worker attempting to claim");
  event.waitUntil(serviceWorkerSelf.clients.claim());
});
serviceWorkerSelf.addEventListener("fetch", async function(event) {
  const url = new URL(event.request.url);
  if (url.pathname.endsWith("newGame.html")) {
    event.respondWith(async function() {
      const url2 = new URL(event.request.url);
      const query = {
        cols: url2.searchParams.get("cols"),
        rows: url2.searchParams.get("rows"),
        mines: url2.searchParams.get("mines")
      };
      const settings = queryToSettings(query);
      if (event.clientId) {
        const client = await serviceWorkerSelf.clients.get(event.clientId);
        if (client)
          client.postMessage({
            type: "set-cookie",
            cookieName,
            cookieValue: settings
          });
      }
      const headers = new Headers;
      const response = new Response(gridToHtml(newGrid(settings)), {
        status: 200,
        statusText: "OK",
        headers
      });
      return response;
    }());
    return;
  }
  if (event.request.url.endsWith("reveal.html")) {
    event.respondWith(async function() {
      const formData = await event.request.formData();
      const state = cellListToGameState(formData.getAll("grid__cell").map((value) => JSON.parse(value)));
      const selectedDataString = formData.get("selected");
      if (typeof selectedDataString !== "string")
        throw Error();
      const selectedParsed = JSON.parse(selectedDataString);
      select(state, selectedParsed);
      const headers = new Headers;
      const response = new Response(GameState({
        contents: gridToHtml(state.grid),
        stateMessage: gameStateToHtml(state.state)
      }), {
        status: 200,
        statusText: "OK",
        headers
      });
      return response;
    }());
    return;
  }
  if (event.request.method !== "GET")
    return;
  if (event.request.url.startsWith("https://unpkg.com/htmx.org")) {
    event.respondWith(cacheFirst(event.request));
    return;
  }
  event.respondWith(async function() {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse)
      return cachedResponse;
    const response = await event.preloadResponse;
    if (response)
      return response;
    return fetch(event.request);
  }());
});
