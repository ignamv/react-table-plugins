const { useRef, useEffect } = require("react");

/**
 * react-table hook to allow user to switch pages using mouse wheel
 * @memberof module:hooks
 */
module.exports.useWheelPaging = function (hooks) {
  function getTableBodyProps(props, { instance: { previousPage, nextPage } }) {
    const ref = useRef();
    useEffect(() => {
      const onWheel = (ev) => {
        if (ev.deltaY > 0) {
          nextPage();
          ev.preventDefault();
        } else {
          previousPage();
          ev.preventDefault();
        }
      }
      ref.current.addEventListener('wheel', onWheel);
      return function cleanUp() {
        ref.current.removeEventListener(onWheel);
      };
    }, [nextPage, previousPage]);
    return { ref, ...props };
  }
  hooks.getTableBodyProps.push(getTableBodyProps);
};
