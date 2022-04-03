/**
 * @jest-environment jsdom
 */
const { expect, test, beforeEach, afterEach } = require("@jest/globals");
const { createElement } = require("react");
const { render } = require("react-dom");
const { act } = require("react-dom/test-utils");
const { usePagination, useFilters, useSortBy } = require("react-table");
const { columnsFromAccessors } = require("./helpers");
const { generateSampleData } = require("./testData");
const {
  setupReactTest,
  teardownReactTest,
  getContainer,
  ReactTableTestHarness,
} = require("./testHelpers");
const { useSelectSingleRow } = require("./useSelectSingleRow");

beforeEach(setupReactTest);
afterEach(teardownReactTest);

const e = createElement;

const testData = generateSampleData(4, 200, 5);
const columns = columnsFromAccessors(Object.keys(testData[0]));

test("useSelectSingleRow", () => {
  const container = getContainer();
  const pageSize = 10;
  const tableArgs = [
    {
      data: testData,
      columns,
      initialState: { pageSize },
    },
    useFilters,
    useSortBy,
    usePagination,
    useSelectSingleRow,
  ];
  const onRender = jest.fn();
  function getLastRender() {
    return onRender.mock.calls[onRender.mock.calls.length - 1][0];
  }
  let tbody;
  function sendkey(key, repetitions = 1) {
    act(() => {
      for (let ii = 0; ii < repetitions; ii++) {
        tbody.dispatchEvent(
          new KeyboardEvent("keydown", { key, bubbles: true })
        );
      }
    });
  }
  function selectedRowPosition(container) {
    const [...trs] = container.getElementsByTagName("tr");
    const selected = trs.map((tr) => tr.classList.contains("selected"));
    const position = selected.indexOf(true) - 1; // Ignore header row
    const nSelectedRows = selected.reduce((x, y) => x + y);
    expect(nSelectedRows).toBe(1);
    return position;
  }
  function assertSelected(index, position) {
    let { instance } = getLastRender();
    expect(instance.state.selectedRowIndex).toBe(index);
    // Ensure I'm in the right page
    expect(instance.state.pageIndex).toBe(Math.floor(position / pageSize));
    // And highlighting the right row
    expect(selectedRowPosition(container)).toBe(position % pageSize);
  }
  act(() => {
    render(e(ReactTableTestHarness, { onRender, tableArgs }), container);
  });
  [tbody] = container.getElementsByTagName("tbody");
  // Starts at the top
  assertSelected(0, 0);
  // Try going over the first row
  sendkey("ArrowUp", 2);
  // Should stay at first row
  assertSelected(0, 0);
  // Go down one row
  sendkey("ArrowDown");
  assertSelected(1, 1);
  // Go down one page manually
  sendkey("ArrowDown", 10);
  assertSelected(11, 11);
  // Down one page with PageDown
  sendkey("PageDown");
  assertSelected(21, 21);
  // And back
  sendkey("PageUp");
  assertSelected(11, 11);
  sendkey("ArrowUp", 2);
  assertSelected(9, 9);
  // Scroll away and check that the active page is switched to
  act(() => {
    getLastRender().instance.nextPage();
  });
  sendkey("ArrowUp");
  assertSelected(8, 8);
  // Selection stays visible after sorting
  act(() => {
    getLastRender().instance.setSortBy([{ id: "col0" }]);
  });
  let newPosition = getLastRender().instance.rows.findIndex(
    (r) => r.index == 8
  );
  assertSelected(8, newPosition);
  // Ensure the test data is good and this sorting operation actually sent
  // me to another page
  // FIXME: fragile test, could break if the PRNG changes
  expect(newPosition).toBeGreaterThan(9);
  // Selection stays visible after filtering IF not filtered out
  act(() => {
    getLastRender().instance.setFilter("col1", testData[8].col1);
  });
  newPosition = getLastRender().instance.rows.findIndex((r) => r.index == 8);
  assertSelected(8, newPosition);
  // Filter out selected row, selection jumps to first row
  const newFilter = testData.find((r) => r.col0 != testData[8].col0).col0;
  act(() => {
    getLastRender().instance.setFilter("col0", newFilter);
  });
  assertSelected(getLastRender().instance.rows[0].index, 0);
});
