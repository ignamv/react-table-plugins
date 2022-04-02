const { createElement } = require("react");

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
