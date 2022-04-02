const { columnsFromAccessors } = require("./helpers");

test("columnsFromAccessors", () => {
  expect(columnsFromAccessors(["name", "age"])).toEqual([
    { accessor: "name", Header: "name" },
    { accessor: "age", Header: "age" },
  ]);
});
