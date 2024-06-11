export type GridCell = { x: number; y: number; expr: string };
export type GridRow = GridCell[];
export type Grid = GridRow[];

export type SheetSettings = {
    numRows: number;
    numCols: number;
};

export type SheetState = {
    grid: Grid;
    settings: SheetSettings;
    selected?: GridCell;
};
