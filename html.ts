// A tagged template function to invoke Prettier's built-in formatting

import type { GridCell as GridCellType } from "./types";

// See https://prettier.io/blog/2020/08/24/2.1.0.html
const html: typeof String.raw = (templates, ...args): string =>
    String.raw(templates, ...args);

type WithContents = { contents: string };

export const Page = ({ contents }: WithContents) => html`
    <!doctype html>
    <html class="no-js" lang="">
        <head>
            <meta charset="utf-8" />
            <meta http-equiv="x-ua-compatible" content="ie=edge" />
            <title>Spreadsheet in Hypermedia</title>
            <meta
                name="description"
                content="Spreadsheet in hypermedia experiment"
            />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            ${"" /* favicons from https://favicon.io/emoji-favicons/bomb */}
            <link
                rel="apple-touch-icon"
                sizes="180x180"
                href="/apple-touch-icon.png"
            />
            <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href="/favicon-32x32.png"
            />
            <link
                rel="icon"
                type="image/png"
                sizes="16x16"
                href="/favicon-16x16.png"
            />
            <link rel="manifest" href="/site.webmanifest" />
            <link
                rel="stylesheet"
                href="/site.css"
                type="text/css"
                media="screen"
            />
        </head>

        <body>
            ${contents}

            <script
                src="https://unpkg.com/htmx.org@1.9.10"
                integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC"
                crossorigin="anonymous"
            ></script>
        </body>
    </html>
`;

export const CellContents = (cell: GridCellType) => html`
    <button
        type="submit"
        name="selected"
        value="${JSON.stringify(cell).replaceAll('"', "&quot;")}"
    >
        ${
            cell.expr /* TODO: This should be the cell's value, and only show the expr when we click it */
        }
    </button>
`;
export const GridCell = (cell: GridCellType) =>
    html`<td class="grid__cell">
        <input
            name="grid__cell"
            type="hidden"
            value="${JSON.stringify(cell).replaceAll('"', "&quot;")}"
        />
        ${CellContents(cell)}
    </td>`;
export const GridRow = ({ contents }: WithContents) => html`
    <tr class="grid__row">
        ${contents}
    </tr>
`;

export const Grid = ({ contents }: WithContents) =>
    html`<table>
        ${contents}
    </table> `;

export const UnselectedFormulaBar = () =>
    html`<div>Select a cell to edit</div>`;
export const FormulaBar = (cell: GridCellType) =>
    html`<div>
        ${cell.x},${cell.y}:
        <input
            type="hidden"
            name="editing"
            value="${JSON.stringify(cell).replaceAll('"', "&quot;")}"
        />
        <input
            id="formula"
            name="formula"
            autofocus="true"
            value="${cell.expr}"
            hx-post="/editCell.html"
            hx-trigger="input delay:250ms"
            hx-swap="outerHTML"
            hx-target="closest form"
            placeholder="Type a value or a formula here"
        />
    </div>`;

export const Sheet = ({
    formulaBar,
    grid,
}: {
    formulaBar: string;
    grid: string;
}) =>
    html`<form hx-post="/selectCell.html" hx-swap="outerHTML" class="grid">
        ${formulaBar} ${grid}
    </form>`;
