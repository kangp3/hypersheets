import type * as Type from "./types";
import * as HTML from "./html";
import { DEFAULTS } from "./sheet";
import { Sheet } from "./js-spreadsheet-dist/Sheet";

export const queryToSettings = ({
    rows,
    cols,
}: { [key in string]: unknown }): Type.SheetSettings => {
    const settings = { ...DEFAULTS };
    if (Number.isSafeInteger(Number(rows))) settings.numRows = Number(rows);
    if (Number.isSafeInteger(Number(cols))) settings.numCols = Number(cols);
    return settings;
};

export const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const xyToCellIndex: (point: { x: number; y: number }) => string = ({
    x,
    y,
}) => {
    const a = alphabet[x];
    if (!a) throw new Error("Big X values not yet implemented");
    return `${a}${y + 1}`;
};
export const alphaArray = (n: number): string[] =>
    Array(n)
        .fill(1)
        .map((_, i) => alphabet[i]);
export const cellListToSheetState: (
    cells: Type.GridCell[],
    selected?: Type.GridCell,
) => Type.SheetState = (cells, selected) => {
    const spreadsheet = new Sheet();
    const grid: Type.Grid = [];
    let maxColumn = 0;
    let maxRow = 0;
    cells.forEach((cell) => {
        const { y, x } = cell;
        if (!grid[y]) grid[y] = [];
        grid[y][x] = cell;
        maxColumn = Math.max(maxColumn, x);
        maxRow = Math.max(maxRow, y);
        spreadsheet.setCell(xyToCellIndex(cell), cell.expr);
    });

    const numCols = maxColumn + 1;
    const numRows = maxRow + 1;

    return {
        grid,
        settings: {
            numRows,
            numCols,
        },
        selected,
        spreadsheet,
    };
};

export const gridToHtml: (grid: Type.Grid, numCols: number) => string = (
    grid,
    numCols,
) =>
    HTML.Grid({
        contents: grid
            .map((row, index) =>
                HTML.GridRow({
                    contents: row.map((cell) => HTML.GridCell(cell)).join(""),
                    row: index,
                }),
            )
            .join(""),
        numCols,
    });

export const sheetToHtml: (sheet: Type.SheetState) => string = (sheet) =>
    HTML.Sheet({
        formulaBar: sheet.selected
            ? HTML.FormulaBar(sheet.selected)
            : HTML.UnselectedFormulaBar(),
        grid: gridToHtml(sheet.grid, sheet.settings.numCols),
    });
