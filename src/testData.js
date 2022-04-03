let status = 39467;

function randInt() {
  const multiplier = 1664525;
  const modulus = 0x100000000;
  const increment = 1013904223;
  status = (multiplier * status + increment) % modulus;
  return status;
}

function sample(array, n) {
  return [...Array(n).keys()].map(() => array[randInt() % array.length]);
}

module.exports.generateSampleData = function (
  ncols,
  nrows,
  uniqueValuesPerCol
) {
  const headers = [...Array(ncols).keys()].map(ii => `col${ii}`);
  const nwords = 20
  const words = [...Array(nwords).keys()].map(ii => `val${ii}`);
  const uniqueValues = new Map(
    headers.map((k) => [k, sample(words, uniqueValuesPerCol)])
  );
  const rows = [...Array(nrows).keys()].map(() => {
    const ret = {};
    uniqueValues.forEach((values, key) => {
      ret[key] = sample(values, 1)[0];
    });
    return ret;
  });
  return rows;
};
