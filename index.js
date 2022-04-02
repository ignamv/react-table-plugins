"use strict";

const { actions } = require("react-table");
const {
  useEffect,
  useCallback,
  createElement,
  Fragment,
  useMemo,
} = require("react");

const e = createElement;

actions.setSelectedRowIndex = "setSelectedRowIndex";
actions.moveSelection = "moveSelection";
actions.updateRowPosition = "updateRowPosition";

module.exports.useWheelPaging = function (hooks) {
  function getTableBodyProps(props, { instance: { previousPage, nextPage } }) {
    const onWheel = useCallback(
      (ev) => {
        if (ev.deltaY > 0) {
          nextPage();
        } else {
          previousPage();
        }
        //ev.preventDefault(); // FIXME: ignored by react because "passive listener" (?)
      },
      [nextPage, previousPage]
    );
    return { onWheel, ...props };
  }
  hooks.getTableBodyProps.push(getTableBodyProps);
};

module.exports.useSelectSingleRow = function (hooks) {
  function getRowProps(props, { row, instance }) {
    const {
      setSelectedRowIndex,
      state: { selectedRowIndex },
    } = instance;
    console.log(selectedRowIndex);
    const onClick = () => {
      setSelectedRowIndex(row.index);
      console.log(`Selecting ${row.index}`);
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

  function reducer(state, action, previousState, instance) {
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

module.exports.TableBodyRows = function ({ page, prepareRow }) {
  return e(
    Fragment,
    null,
    page.map((row) => {
      prepareRow(row);
      const cells = row.cells.map((cell) =>
        e("td", { ...cell.getCellProps() }, cell.render("Cell"))
      );
      return e("tr", { ...row.getRowProps() }, cells);
    })
  );
};

module.exports.TableHead = function ({ headerGroups, makecell }) {
  return e(
    "thead",
    null,
    headerGroups.map((headerGroup) =>
      e(
        "tr",
        { ...headerGroup.getHeaderGroupProps() },
        headerGroup.headers.map(makecell)
      )
    )
  );
};

// This is a custom filter UI for selecting
// a unique option from a list
module.exports.SelectColumnFilter = function ({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const [sortedOptions, optionToIndex] = useMemo(() => {
    const uniqueOptions = new Set();
    preFilteredRows.forEach((row) => {
      uniqueOptions.add(row.values[id]);
    });
    const sortedOptions = [...uniqueOptions.values()];
    sortedOptions.sort();
    const optionToIndex = new Map();
    sortedOptions.forEach((option, idx) => {
      optionToIndex.set(option, idx);
    });
    return [sortedOptions, optionToIndex];
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return e(
    "select",
    {
      value: optionToIndex.get(filterValue) || "",
      onChange: (e) => {
        setFilter(sortedOptions[parseInt(e.target.value)] || undefined);
      },
    },
    e("option", { value: "" }, "All"),
    sortedOptions.map((option, i) => e("option", { key: i, value: i }, option))
  );
};