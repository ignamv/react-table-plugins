const { generateSampleData } = require("./testData");

test("example output", () => {
  const actual = generateSampleData(3, 3, 2);
  const expected = [
    { "col0": "val18", "col1": "val15", "col2": "val6", },
    { "col0": "val17", "col1": "val12", "col2": "val9", },
    { "col0": "val18", "col1": "val15", "col2": "val6", },
  ];

  expect(actual).toEqual(expected);
});
