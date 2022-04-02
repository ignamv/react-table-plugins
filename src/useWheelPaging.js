const { useCallback } = require("react");

module.exports.useWheelPaging = function (hooks) {
  function getTableBodyProps(props, { instance: { previousPage, nextPage } }) {
    const onWheel = useCallback(
      (ev) => {
        if (ev.deltaY > 0) {
          nextPage();
        } else {
          previousPage();
        }
      },
      [nextPage, previousPage]
    );
    return { onWheel, ...props };
  }
  hooks.getTableBodyProps.push(getTableBodyProps);
};
