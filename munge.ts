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

export const cellListToSheetState: (cells: Type.GridCell[]) => Type.SheetState = (
    cells,
) => {
    const grid: Type.Grid = [];
    let maxColumn = 0;
    let maxRow = 0;
    cells.forEach((cell) => {
		// TODO
    });

    const numCols = maxColumn + 1;
    const numRows = maxRow + 1;

    return {
        grid,
        settings: {
            numRows,
            numCols,
        },
    };
};

export const gridToHtml: (grid: Type.Grid) => string = (grid): string =>
    HTML.Grid({
        contents: grid
            .map((row, index) =>
                HTML.GridRow({
                    contents: row.map((cell) => HTML.GridCell(cell)).join(""),
                    row: index,
                }),
            )
            .join(""),
    });
