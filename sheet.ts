import { randIntBetween } from "./utilities";
import type { SheetSettings, SheetState, GridCell, Grid } from "./types";

export const DEFAULTS: SheetSettings = {
    numRows: 10,
    numCols: 10,
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
    };
};
