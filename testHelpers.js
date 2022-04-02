const { useMemo } = require("react");
const { unmountComponentAtNode } = require("react-dom");
const { useTable } = require("react-table");

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
  } = instance;
  const page = maybePage !== undefined ? maybePage : outputRows;
  const headers = headerGroups.map((headerGroup) =>
    headerGroup.headers.map((header) => header.Header)
  );
  const values = page.map((row) => {
    prepareRow(row);
    return row.cells.map((cell) => cell.value);
  });
  onRender({ values, headers, instance });
  return null;
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
