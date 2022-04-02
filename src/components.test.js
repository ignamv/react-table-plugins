/**
 * @jest-environment jsdom
 */
const { expect, test, beforeEach, afterEach } = require("@jest/globals");
const { createElement, useMemo } = require("react");
const { render } = require("react-dom");
const { act } = require("react-dom/test-utils");
const { useTable } = require("react-table/dist/react-table.development");
const { TableHead, TableBodyRows } = require("./components");
const { columnsFromAccessors } = require("./helpers");
const { generateSampleData } = require("./testData");
const {
  getContainer,
  setupReactTest,
  teardownReactTest,
} = require("./testHelpers");
const e = createElement;

const testData = generateSampleData(5, 10, 4);

beforeEach(setupReactTest);
afterEach(teardownReactTest);

test("tablehead", () => {
  let container = getContainer();
  function DummyTable() {
    const data = useMemo(() => testData);
    const columns = useMemo(() =>
      columnsFromAccessors(Object.keys(testData[0]))
    );
    const makecell = (column) =>
      e("th", { ...column.getHeaderProps() }, column.render("Header"));
    const { headerGroups } = useTable({ data, columns });
    return e("table", null, e(TableHead, { headerGroups, makecell }));
  }
  act(() => {
    render(e(DummyTable), container);
  });
  const [table] = container.childNodes;
  const [thead] = table.childNodes;
  const [row] = thead.childNodes;
  const headers = [...row.childNodes].map((node) => {
    expect(node.tagName).toBe("TH");
    return node.childNodes[0].textContent;
  });
  expect(headers).toEqual(Object.keys(testData[0]));
});

test("tablebodyrows", () => {
  const container = getContainer();
  const prepareRow = jest.fn();
  const nrows = 3,
    ncols = 4;
  const page = [...new Array(nrows).keys()].map((rowidx) => ({
    getRowProps: () => ({ role: "row", key: rowidx }),
    cells: [...new Array(ncols).keys()].map((colidx) => ({
      txt: `${rowidx}:${colidx}`,
      render: jest.fn((x) => {
        expect(x).toBe("Cell");
        return `${rowidx}:${colidx}`;
      }),
      getCellProps: () => ({ role: "cell", key: colidx }),
    })),
  }));
  const rows = e(TableBodyRows, { page, prepareRow });
  act(() => {
    render(e("table", null, e("tbody", null, rows)), container);
  });
  expect(prepareRow.mock.calls).toEqual(page.map((row) => [row]));
  const [table] = container.childNodes;
  const [tbody] = table.childNodes;
  const rownodes = [...tbody.childNodes];
  expect(rownodes.length).toBe(nrows);
  rownodes.forEach((tr, rowidx) => {
    expect(tr.getAttribute("role")).toBe("row");
    const cells = [...tr.childNodes];
    expect(cells.length).toBe(ncols);
    cells.forEach((td, colidx) => {
      expect(page[rowidx].cells[colidx].render.mock.calls).toEqual([["Cell"]]);
      expect(td.childNodes[0].textContent).toBe(page[rowidx].cells[colidx].txt);
    });
  });
});
