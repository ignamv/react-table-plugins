const { useMemo, createElement } = require("react");
const { unmountComponentAtNode } = require("react-dom");
const { useTable } = require("react-table");
const { TableBodyRows } = require(".");
const { TableHead } = require("./components");

const e = createElement;

module.exports.ReactTableTestHarness = function ({ onRender, tableArgs }) {
  const [kwargs, ...args] = tableArgs;
  const { rows, columns, ...otherKwargs } = kwargs;

  const memoizedRows = useMemo(() => rows);
  const memoizedColumns = useMemo(() => columns);

  const instance = useTable(
    {
      data: memoizedRows,
      columns: memoizedColumns,
      ...otherKwargs,
    },
    ...args
  );
  const {
    rows: outputRows,
    page: maybePage,
    prepareRow,
    headerGroups,
    getTableBodyProps,
  } = instance;
  const page = maybePage !== undefined ? maybePage : outputRows;
  const headers = headerGroups.map((headerGroup) =>
    headerGroup.headers.map((header) => header.Header)
  );
  const values = page.map((row) => {
    prepareRow(row);
    return row.cells.map((cell) => cell.value);
  });
  if (onRender !== undefined) {
    onRender({ values, headers, instance });
  }
  const makecell = (column) =>
    e("th", { ...column.getHeaderProps() }, column.render("Header"));

  const thead = e(TableHead, { headerGroups, makecell });
  const tbody = e(
    "tbody",
    { ...getTableBodyProps() },
    e(TableBodyRows, { page, prepareRow })
  );
  return e("table", null, thead, tbody);
};

let container;
module.exports.getContainer = function () {
  return container;
};

module.exports.setupReactTest = function () {
  // Setup a DOM container as render target
  container = document.createElement("div");
  document.body.appendChild(container);
};

module.exports.teardownReactTest = function () {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
};
