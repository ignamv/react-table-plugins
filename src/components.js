const { createElement, Fragment } = require("react");

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