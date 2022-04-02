/**
 * @jest-environment jsdom
 */
const { expect, test, beforeEach, afterEach } = require("@jest/globals");
const { createElement } = require("react");
const { render } = require("react-dom");
const { act } = require("react-dom/test-utils");
const { usePagination } = require("react-table/dist/react-table.development");
const { columnsFromAccessors } = require("./helpers");
const { generateSampleData } = require("./testData");
const {
  setupReactTest,
  teardownReactTest,
  ReactTableTestHarness,
  getContainer,
} = require("./testHelpers");
const { useWheelPaging } = require("./useWheelPaging");

beforeEach(setupReactTest);
afterEach(teardownReactTest);

const testData = generateSampleData(5, 25, 5);

test("wheel paging", () => {
  const pageIndices = [];
  const columns = columnsFromAccessors(Object.keys(testData[0]));
  const rows = testData;
  const pageSize = 10;
  const container = getContainer();
  const tableArgs = [
    { columns, rows, initialState: { pageSize } },
    usePagination,
    useWheelPaging,
  ];
  act(() => {
    render(
      createElement(ReactTableTestHarness, {
        tableArgs,
        onRender: ({ instance }) => pageIndices.push(instance.state.pageIndex),
      }),
      container
    );
  });
  expect(rows.length).toBeGreaterThan(2 * pageSize);
  const [tbody] = container.getElementsByTagName("tbody");
  act(() => {
    tbody.dispatchEvent(new WheelEvent("wheel", { deltaY: 1, bubbles: true }));
  });
  act(() => {
    tbody.dispatchEvent(new WheelEvent("wheel", { deltaY: 1, bubbles: true }));
  });
  act(() => {
    tbody.dispatchEvent(new WheelEvent("wheel", { deltaY: 1, bubbles: true }));
    tbody.dispatchEvent(new WheelEvent("wheel", { deltaY: -1, bubbles: true }));
  });
  expect(pageIndices).toEqual([0, 1, 2, 1]);
});
