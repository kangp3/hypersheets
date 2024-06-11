import { Sheet } from "./js-spreadsheet-dist/Sheet";
export type GridCell = {
    x: number;
    y: number;
    expr: string;
    // If we want to store interstitial values
    resolved?: unknown;
    resolvedDisplay?: string;
};
export type GridRow = GridCell[];
export type Grid = GridRow[];

export type SheetSettings = {
    numRows: number;
    numCols: number;
};

export type SheetState = {
    grid: Grid;
    spreadsheet: Sheet;
    settings: SheetSettings;
    selected?: GridCell;
};
