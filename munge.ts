import type * as Type from "./types";
import * as HTML from "./html";
import { DEFAULTS } from "./sheet";

export const queryToSettings = ({
    rows,
    cols,
}: { [key in string]: unknown }): Type.SheetSettings => {
    const settings = { ...DEFAULTS };
    if (Number.isSafeInteger(Number(rows))) settings.numRows = Number(rows);
    if (Number.isSafeInteger(Number(cols))) settings.numCols = Number(cols);
    return settings;
};

export const cellListToSheetState: (
    cells: Type.GridCell[],
    selected?: Type.GridCell,
) => Type.SheetState = (cells, selected) => {
    const grid: Type.Grid = [];
    let maxColumn = 0;
    let maxRow = 0;
    cells.forEach((cell) => {
        const { y, x } = cell;
        if (!grid[y]) grid[y] = [];
        grid[y][x] = cell;
        maxColumn = Math.max(maxColumn, x);
        maxRow = Math.max(maxRow, y);
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
    };
};

export const gridToHtml: (grid: Type.Grid) => string = (grid) =>
    HTML.Grid({
        contents: grid
            .map((row) =>
                HTML.GridRow({
                    contents: row.map((cell) => HTML.GridCell(cell)).join(""),
                }),
            )
            .join(""),
    });

export const sheetToHtml: (sheet: Type.SheetState) => string = (sheet) =>
    HTML.Sheet({
        formulaBar: sheet.selected
            ? HTML.FormulaBar(sheet.selected)
            : HTML.UnselectedFormulaBar(),
        grid: gridToHtml(sheet.grid),
    });
