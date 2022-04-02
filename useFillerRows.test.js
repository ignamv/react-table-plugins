/**
 * @jest-environment jsdom
 */

const React = require("react");
const { render, unmountComponentAtNode } = require("react-dom");
const { act } = require("react-dom/test-utils");
const { usePagination } = require("react-table/dist/react-table.development");
const { columnsFromAccessors } = require("./helpers");
const { generateSampleData } = require("./testData");
const { ReactTableTestHarness } = require("./testHelpers");
const { useFillerRows } = require("./useFillerRows");
const { expect, test } = require("@jest/globals");

let container = null;
const testData = generateSampleData(5, 15, 5);

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

test("filler rows", () => {
  const renders = [];
  const columns = columnsFromAccessors(Object.keys(testData[0]));
  const rows = testData;
  const pageSize = 10;
  const tableArgs = [
    { columns, rows, initialState: { pageSize } },
    usePagination,
    useFillerRows,
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
  // First page is full, no filler rows needed
  let [{ instance }] = renders;
  expect(instance.fillerRows.length).toBe(0);
  renders.splice(0);
  // Second page half full, need filler rows
  act(() => {
    instance.nextPage();
  });
  [{ instance }] = renders;
  expect(rows.length).toBeGreaterThan(pageSize);
  expect(rows.length).toBeLessThan(2 * pageSize);
  expect(instance.fillerRows.length).toBe(rows.length % pageSize);
});
