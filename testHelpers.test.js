/**
 * @jest-environment jsdom
 */

const {
  ReactTableTestHarness,
  setupReactTest,
  teardownReactTest,
  getContainer,
} = require("./testHelpers");
const React = require("react");
const { render } = require("react-dom");
const { act } = require("react-dom/test-utils");
const { columnsFromAccessors } = require("./helpers");
const { generateSampleData } = require("./testData");
const { usePagination } = require("react-table");
const { expect, test } = require("@jest/globals");

const testData = generateSampleData(5, 15, 5);

beforeEach(setupReactTest);
afterEach(teardownReactTest);

test("harness returns headers and values", () => {
  const renders = [];
  const columns = columnsFromAccessors(Object.keys(testData[0]));
  const rows = testData;
  const tableArgs = [{ columns, rows }];
  act(() => {
    render(
      React.createElement(ReactTableTestHarness, {
        tableArgs,
        onRender: (x) => renders.push(x),
      }),
      getContainer()
    );
  });
  expect(renders.length).toBe(1);
  const [{ values, headers }] = renders;
  expect(values).toEqual(
    rows.map((row) => columns.map(({ accessor }) => row[accessor]))
  );
  expect(headers).toEqual([Object.keys(rows[0])]);
});

test("harness works with paging", () => {
  const renders = [];
  const columns = columnsFromAccessors(Object.keys(testData[0]));
  const rows = testData;
  const expectedValues = rows.map((row) =>
    columns.map(({ accessor }) => row[accessor])
  );
  const pageSize = 10;
  const tableArgs = [
    { columns, rows, initialState: { pageSize } },
    usePagination,
  ];
  act(() => {
    render(
      React.createElement(ReactTableTestHarness, {
        tableArgs,
        onRender: (x) => renders.push(x),
      }),
      getContainer()
    );
  });
  // Did first page render correctly?
  let [{ values, headers, instance }] = renders;
  expect(values).toEqual(expectedValues.slice(0, 10));
  expect(headers).toEqual([Object.keys(rows[0])]);
  renders.splice(0);
  // Test second page
  act(() => {
    instance.nextPage();
  });
  [{ values, headers, instance }] = renders;
  expect(values).toEqual(expectedValues.slice(10));
});

test("harness renders thead and tbody", () => {
  const renders = [];
  const container = getContainer();
  const rows = [
    { a: "1", b: "2" },
    { a: "3", b: "4" },
  ];
  const columns = columnsFromAccessors(Object.keys(rows[0]));
  const expectedValues = rows.map((row) =>
    columns.map(({ accessor }) => row[accessor])
  );
  const tableArgs = [{ columns, rows }];
  act(() => {
    render(
      React.createElement(ReactTableTestHarness, {
        tableArgs,
        onRender: (x) => renders.push(x),
      }),
      container
    );
  });
  const [{ instance }] = renders;
  renders.pop();
  const [table] = container.childNodes;
  const [thead, tbody] = table.childNodes;
  const [headrow] = thead.childNodes;
  [...headrow.childNodes].forEach((th, idx) => {
    expect(th.tagName).toBe("TH");
    expect(th.childNodes[0].textContent).toBe(columns[idx].Header);
  });
  expect(tbody.getAttribute("role")).toBe(instance.getTableBodyProps()["role"]);
  const actualValues = [...tbody.childNodes].map((tr) => {
    expect(tr.tagName).toBe("TR");
    return [...tr.childNodes].map((td) => {
      expect(td.tagName).toBe("TD");
      return td.childNodes[0].textContent;
    });
  });
  expect(actualValues).toEqual(expectedValues);
});
