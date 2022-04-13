/**
 * Helpers for testing react-table
 * @module
 */

const { useMemo, createElement } = require("react");
const { unmountComponentAtNode } = require("react-dom");
const { useTable } = require("react-table");
const { TableHead, TableBodyRows } = require("./components");
const PropTypes = require("prop-types");

const e = createElement;

/**
 * Component to simplify react-table tests. Renders a basic table and calls
 * onRender on each render.
 *
 * @param {Object} props
 * @param {Function} props.onRender - Function called on each render with a single
 * argument, {instance, values, headers}. `instance` is the `useTable` return
 * value, `values` the rendered cell values and `headers` the rendered
 * column headers
 * @param {Array} props.tableArgs - parameters for `useTable`
 */
module.exports.ReactTableTestHarness = function (props) {
  const { onRender, tableArgs } = props;
  const [kwargs, ...args] = tableArgs;
  const { rows, columns, ...otherKwargs } = kwargs;

  const instance = useTable(
    {
      data: rows,
      columns,
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

module.exports.ReactTableTestHarness.propTypes = {
  onRender: PropTypes.func,
  tableArgs: PropTypes.array.isRequired,
};

let container;
/**
 * Return container for React to render into during a test
 * @returns {HTMLElement} container
 */
module.exports.getContainer = function () {
  return container;
};

/**
 * Create container for React to render into during a test
 */
module.exports.setupReactTest = function () {
  // Setup a DOM container as render target
  container = document.createElement("div");
  document.body.appendChild(container);
};

/**
 * Remove React container after test
 */
module.exports.teardownReactTest = function () {
  unmountComponentAtNode(container);
  container.remove();
  container = null;
};
