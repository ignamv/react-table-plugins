/**
 * @jest-environment jsdom
 */
const { expect, test, beforeEach, afterEach } = require("@jest/globals");
const { createElement, useMemo, useState } = require("react");
const { render } = require("react-dom");
const { act } = require("react-dom/test-utils");
const { useTable } = require("react-table/dist/react-table.development");
const {
  TableHead,
  TableBodyRows,
  SelectColumnFilter,
} = require("./components");
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

test("selectcolumnfilter", () => {
  const container = getContainer();
  const onSetFilter = jest.fn();
  const preFilteredRows = [2, 5, 3, 2, 2, 5, 5, 3, 3].map((x) => ({
    values: {
      a: x,
      b: x + 10,
    },
  }));
  const id = "a";
  function SelectColumnFilterHarness({ onSetFilter }) {
    // Initialize with value 0 to check that it's displayed correctly
    const [filterValue, setFilter] = useState(2);
    return e(SelectColumnFilter, {
      column: {
        filterValue,
        setFilter: (value) => {
          setFilter(value);
          onSetFilter(value);
        },
        preFilteredRows,
        id,
      },
    });
  }
  act(() => {
    render(e(SelectColumnFilterHarness, { onSetFilter }), container);
  });
  const [select] = container.childNodes;
  expect(select.value).toBe('0');
  const [firstoption, ...options] = select.childNodes;
  expect(firstoption.getAttribute("value")).toBe("");
  expect(firstoption.textContent).toBe("All");
  [2, 3, 5].forEach((value, idx) => {
    const option = options[idx];
    expect(option.getAttribute("value")).toBe(idx.toString());
    expect(option.textContent).toBe(value.toString());
  });
  expect(onSetFilter.mock.calls.length).toBe(0);
  const actives = [];
  for (const option of select.childNodes) {
    act(() => {
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    const active = container
      .getElementsByTagName("select")[0]
      .classList.contains("active");
    actives.push(active);
  }
  expect(onSetFilter.mock.calls).toEqual([[undefined], [2], [3], [5]]);
  expect(actives).toEqual([false, true, true, true]);
});
