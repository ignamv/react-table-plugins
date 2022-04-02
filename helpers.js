module.exports.columnsFromAccessors = function (accessors) {
  return accessors.map((accessor) => ({
    accessor,
    Header: accessor,
  }));
};
