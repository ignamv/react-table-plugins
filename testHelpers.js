const { useMemo } = require("react");
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
