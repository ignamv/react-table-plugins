const { createElement, Fragment, useMemo } = require("react");

const e = createElement;

module.exports.TableHead = function ({ headerGroups, makecell }) {
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

module.exports.TableBodyRows = function ({ page, prepareRow }) {
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
