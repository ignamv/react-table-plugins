/**
 * Helper functions
 * @module helpers
 */

/**
 * Generates the `columns` input required by `useTable` using the row
 * attribute names as headers
 * @param  {Array<string>} accessors - Array of row attribute names
 * @returns {Array<{accessor: string, Header: string}>} columns
 */
module.exports.columnsFromAccessors = function (accessors) {
  return accessors.map((accessor) => ({
    accessor,
    Header: accessor,
  }));
};
