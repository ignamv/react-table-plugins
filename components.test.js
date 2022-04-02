/**
 * @jest-environment jsdom
 */
const { expect, test } = require("@jest/globals");
const { createElement, useMemo } = require("react");
const { render } = require("react-dom");
const { act } = require("react-dom/test-utils");
const { useTable } = require("react-table/dist/react-table.development");
const { TableHead } = require("./components");
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
