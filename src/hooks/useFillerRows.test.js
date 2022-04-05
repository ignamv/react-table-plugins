/**
 * @jest-environment jsdom
 */

const React = require("react");
const { render } = require("react-dom");
const { act } = require("react-dom/test-utils");
const { usePagination } = require("react-table/dist/react-table.development");
const { columnsFromAccessors } = require("../helpers");
const { generateSampleData } = require("../testData");
const {
  ReactTableTestHarness,
  setupReactTest,
  teardownReactTest,
  getContainer,
} = require("../testHelpers");
const { useFillerRows } = require("./useFillerRows");
const { expect, test, beforeEach, afterEach } = require("@jest/globals");

const testData = generateSampleData(5, 15, 5);

beforeEach(setupReactTest);
afterEach(teardownReactTest);

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
      getContainer()
    );
  });
  // First page is full, no filler rows needed
  expect(rows.length).toBeGreaterThan(pageSize);
  let [{ instance }] = renders;
  expect(instance.fillerRows.length).toBe(0);
  renders.splice(0);
  // Second page half full, need filler rows
  expect(rows.length).toBeLessThan(2 * pageSize);
  act(() => {
    instance.nextPage();
  });
  [{ instance }] = renders;
  expect(instance.fillerRows.length).toBe(rows.length % pageSize);
});
