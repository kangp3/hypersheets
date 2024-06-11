import { randIntBetween } from "./utilities";
import type { SheetSettings, SheetState, GridCell, Grid } from "./types";
import { Sheet } from "./js-spreadsheet-dist/Sheet";

export const DEFAULTS: SheetSettings = {
    numRows: 13,
    numCols: 8,
};

export const newGrid = ({ numRows, numCols }: SheetSettings): Grid => {
    const grid: Grid = Array(numRows)
        .fill(1)
        .map((_, y) =>
            Array(numCols)
                .fill(1)
                .map((_, x) => {
                    return {
                        expr: "",
                        x,
                        y,
                    };
                }),
        );

    return grid;
};
export const newSheet = (settings: SheetSettings): SheetState => {
    return {
        grid: newGrid(settings),
        settings,
        spreadsheet: new Sheet(),
    };
};
