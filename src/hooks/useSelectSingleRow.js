const { useEffect } = require("react");
const { actions } = require("react-table");

actions.setSelectedRowIndex = "setSelectedRowIndex";
actions.moveSelection = "moveSelection";
actions.updateRowPosition = "updateRowPosition";

/**
 * react-table hook to allow user to select a single row
 *
 * Adds property `selectedRowIndex` to table `state`.
 *
 * Adds function `setSelectedRowIndex` to table instance.
 *
 * The selected row gets a `className` of `selected`.
 *
 * User can move selection by clicking rows or pressing arrow keys/PageUp/
 * PageDown.
 *
 * When the table is filtered or resorted, keep the selected row visible.
 * If the selected row is filtered out, move selection to the first row.
 * @memberof module:hooks
 */
module.exports.useSelectSingleRow = function (hooks) {
  function getRowProps(props, { row, instance }) {
    const {
      setSelectedRowIndex,
      state: { selectedRowIndex },
    } = instance;
    const onClick = () => {
      setSelectedRowIndex(row.index);
    };
    const className = row.index == selectedRowIndex ? "selected" : "";
    return { onClick, className, ...props };
  }

  function useInstance(instance) {
    const setSelectedRowIndex = (index) =>
      instance.dispatch({ type: actions.setSelectedRowIndex, index });
    const selectPreviousRow = () =>
      instance.dispatch({ type: actions.moveSelection, delta: -1 });
    const selectNextRow = () =>
      instance.dispatch({ type: actions.moveSelection, delta: 1 });
    const pageUp = () =>
      instance.dispatch({
        type: actions.moveSelection,
        delta: -instance.state.pageSize,
      });
    const pageDown = () =>
      instance.dispatch({
        type: actions.moveSelection,
        delta: instance.state.pageSize,
      });
    useEffect(
      () => instance.dispatch({ type: actions.updateRowPosition }),
      [instance.state.filters, instance.state.sortBy]
    );
    Object.assign(instance, {
      setSelectedRowIndex,
      selectPreviousRow,
      selectNextRow,
      pageUp,
      pageDown,
    });
  }

  function reducer(state, action, _previousState, instance) {
    if (action.type === actions.init) {
      return {
        // Actual index (independent of sorting and filtering)
        selectedRowIndex: 0,
        // Position of row after sorting and filtering
        selectedRowPosition: 0,
        ...state,
      };
    }
    if (action.type === actions.setSelectedRowIndex) {
      const position_in_page = instance.page.findIndex(
        (row) => row.index == action.index
      );
      const selectedRowPosition =
        position_in_page !== -1
          ? state.pageIndex * state.pageSize + position_in_page
          : instance.rows.findIndex((row) => row.index == action.index);
      return {
        ...state,
        selectedRowPosition,
        selectedRowIndex: action.index,
      };
    }
    if (action.type === actions.moveSelection) {
      const selectedRowPosition = Math.max(
        0,
        Math.min(
          instance.rows.length - 1,
          state.selectedRowPosition + action.delta
        )
      );
      const selectedRowIndex = instance.rows[selectedRowPosition].index;
      const pageIndex = Math.floor(selectedRowPosition / state.pageSize);
      return {
        ...state,
        selectedRowPosition,
        selectedRowIndex,
        pageIndex,
      };
    }
    if (action.type === actions.updateRowPosition) {
      const selectedRowPosition = instance.rows.findIndex(
        (row) => row.index == state.selectedRowIndex
      );
      const pageIndex = Math.floor(selectedRowPosition / state.pageSize);
      if (selectedRowPosition !== -1) {
        return {
          ...state,
          selectedRowPosition,
          selectedRowIndex: state.selectedRowIndex,
          pageIndex,
        };
      }
      return {
        ...state,
        selectedRowPosition: 0,
        selectedRowIndex: instance.rows[0].index,
        pageIndex: 0,
      };
    }
  }

  function getTableBodyProps(props, { instance }) {
    const onKeyDown = (ev) => {
      if (ev.key == "ArrowDown") {
        instance.selectNextRow();
      } else if (ev.key == "ArrowUp") {
        instance.selectPreviousRow();
      } else if (ev.key == "PageDown") {
        instance.pageDown();
      } else if (ev.key == "PageUp") {
        instance.pageUp();
      }
    };
    return { tabIndex: 0, onKeyDown, ...props };
  }

  hooks.getRowProps.push(getRowProps);
  hooks.stateReducers.push(reducer);
  hooks.useInstance.push(useInstance);
  hooks.getTableBodyProps.push(getTableBodyProps);
};
