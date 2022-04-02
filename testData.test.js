const { generateSampleData } = require("./testData");

test("example output", () => {
  const actual = generateSampleData(3, 3, 2);
  const expected = [
    { place: "government", fact: "day", life: "time" },
    { place: "part", fact: "life", life: "course" },
    { place: "government", fact: "day", life: "time" },
  ];
  expect(actual).toEqual(expected);
});
