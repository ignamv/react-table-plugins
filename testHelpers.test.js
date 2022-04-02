/**
 * @jest-environment jsdom
 */

const { ReactTableTestHarness } = require("./testHelpers");
const React = require("react");
const { render, unmountComponentAtNode } = require("react-dom");
const { act } = require("react-dom/test-utils");
const { columnsFromAccessors } = require("./helpers");
const { generateSampleData } = require("./testData");
const { usePagination } = require("react-table");
const { expect, test } = require("@jest/globals");

const testData = generateSampleData(5, 15, 5);

let container = null;

beforeEach(() => {
  // Setup a DOM container as render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // Cleanup
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

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
      container
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
      container
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
