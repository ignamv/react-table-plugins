# react-table-plugins

This package provides plugins and components for use with [react-table](https://react-table.tanstack.com/).
You can see them in action [here](https://ignamv.github.io/react-table-plugins)

## Plugins

### useSelectSingleRow

Allows the user to click on a row to select it,
and move the selection with the arrow keys/PageUp/PageDown/Home/End.
Ensures the selection stays visible when going over page boundaries,
sorting or filtering.
The selected row can be retrieved from `tableInstance.state.selectedRowIndex`
and set with `tableInstance.setSelectedRowIndex`.

### useWheelPaging

Allows the user to go the the next/previous page using the mouse wheel over the table.

### useFillerRows

Provides the attribute `tableInstance.fillerRows` with value
`[0, 1, ..., pageSize-page.length]`.
This can be mapped over to generate dummy rows and ensure the table height remains constant,
even if the last page is half-full.

## Components

### SelectColumnFilter

For use with the `useFilter` plugin.
Renders a `<Select>` with all values in the column,
similar to the `SelectColumnFilter` component in the `useFilter` example.
However, the values are sorted, it can be styled when active, 
and calls `setFilter` with the original value (not converting to string).
