const { useCallback } = require("react");

/**
 * react-table hook to allow user to switch pages using mouse wheel 
 */
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
