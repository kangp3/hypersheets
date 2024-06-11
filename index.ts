import express, { json, urlencoded } from "express";
import type { ErrorRequestHandler } from "express";
import cookieParser from "cookie-parser";
import type {
    Grid as GridType,
    GridCell as GridCellType,
    SheetSettings,
} from "./types";
import { Page } from "./html";
import {
    cellListToSheetState,
    gridToHtml,
    sheetToHtml,
    xyToCellIndex,
} from "./munge";
import { DEFAULTS, newGrid, newSheet } from "./sheet";

const app = express();
const port = process.env.PORT || 3004;

app.use(cookieParser());
app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    res.send(Page({ contents: sheetToHtml(newSheet(DEFAULTS)) }));
});

app.post("/selectCell.html", (req, res) => {
    const { grid__cell, selected } = req.body;

    const selectedParsed: GridCellType = JSON.parse(selected);
    const state = cellListToSheetState(
        grid__cell.map((value: string) => JSON.parse(value)),
        selectedParsed,
    );

    res.send(sheetToHtml(state));
});

app.post("/editCell.html", (req, res) => {
    const { grid__cell, editing, formula } = req.body;

    const editingParsed: GridCellType = JSON.parse(editing);
    const state = cellListToSheetState(
        grid__cell.map((value: string) => JSON.parse(value)),
        editingParsed,
    );

    state.grid[editingParsed.y][editingParsed.x].expr = formula;
    state.selected!.expr = formula;

    state.spreadsheet.setCell(
        xyToCellIndex(state.selected!),
        state.selected!.expr,
    );

    // TODO: Resolve everything

    res.send(sheetToHtml(state));
});

app.use(express.static("public"));

//
// Final 404/5XX handlers
//
app.use(function (err, req, res, next) {
    console.error("5XX", err);
    res.status(err?.status || 500);

    res.send("500");
} as ErrorRequestHandler);

app.use(function (_req, res) {
    res.status(404);
    res.send("404");
});

const baseDomain =
    process.env.NODE_ENV === "production"
        ? `localhost:${port}`
        : `localhost:${port}`;
const baseURL =
    process.env.NODE_ENV === "production"
        ? `https://${baseDomain}`
        : `http://${baseDomain}`;
const listener = app.listen(port, () => {
    console.log(`Server is available at ${baseURL}`);
});

// So I can kill from local terminal with Ctrl-c
// From https://github.com/strongloop/node-foreman/issues/118#issuecomment-475902308
process.on("SIGINT", () => {
    listener.close(() => {});
    // Just wait some amount of time before exiting. Ideally the listener would
    // close successfully, but it seems to hang for some reason.
    setTimeout(() => process.exit(0), 150);
});
