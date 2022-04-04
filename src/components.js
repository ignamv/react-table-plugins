/**
 * Components for use with react-table
 * @module components
 */
const { createElement, Fragment, useMemo } = require("react");
const PropTypes = require("prop-types");

const e = createElement;

/**
 * Render a `<thead>` for react-table
 * @param {Object} props
 * @param {*} props.headerGroups - from react-table instance
 * @param {Function} props.makecell - function taking a `column` parameter
 * and returning a `<th>`
 */
module.exports.TableHead = function (props) {
  const { headerGroups, makecell } = props;
  return e(
    "thead",
    null,
    headerGroups.map((headerGroup) =>
      e(
        "tr",
        { ...headerGroup.getHeaderGroupProps() },
        headerGroup.headers.map(makecell)
      )
    )
  );
};

module.exports.TableHead.propTypes = {
  headerGroups: PropTypes.array.isRequired,
  makecell: PropTypes.elementType.isRequired,
};

/**
 * Render the rows that go in `<tbody>` for react-table
 * @param {Object} props
 * @param {*} props.page - from react-table instance
 * @param {*} props.prepareRow - from react-table instance
 */
module.exports.TableBodyRows = function (props) {
  const { page, prepareRow } = props;
  return e(
    Fragment,
    null,
    page.map((row) => {
      prepareRow(row);
      const cells = row.cells.map((cell) =>
        e("td", { ...cell.getCellProps() }, cell.render("Cell"))
      );
      return e("tr", { ...row.getRowProps() }, cells);
    })
  );
};

module.exports.TableBodyRows.propTypes = {
  page: PropTypes.array.isRequired,
  prepareRow: PropTypes.func.isRequired,
};

/**
 * Select box for react-table's `useFilters`.
 *
 * Use this in the `Filter` property of the `columns`
 * or in the `Filter` property of `defaultColumn`.
 *
 * The options are sorted and the original type (e.g. `number`) is conserved
 * (not converted to `string`)
 */
module.exports.SelectColumnFilter = function ({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const [sortedOptions, optionToIndex] = useMemo(() => {
    const uniqueOptions = new Set();
    preFilteredRows.forEach((row) => {
      uniqueOptions.add(row.values[id]);
    });
    const sortedOptions = [...uniqueOptions.values()];
    sortedOptions.sort();
    const optionToIndex = new Map();
    sortedOptions.forEach((option, idx) => {
      optionToIndex.set(option, idx);
    });
    return [sortedOptions, optionToIndex];
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return e(
    "select",
    {
      value: optionToIndex.get(filterValue) || "",
      onChange: (e) => {
        setFilter(sortedOptions[parseInt(e.target.value)] || undefined);
      },
    },
    e("option", { value: "" }, "All"),
    sortedOptions.map((option, i) => e("option", { key: i, value: i }, option))
  );
};
