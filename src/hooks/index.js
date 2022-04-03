/**
 * Hooks for react-table
 * @module hooks
 */

/**
 * react-table hook to ensure the table height is equal for all pages
 * 
 * Adds a `fillerRows` property to the table instance.
 * 
 * * When the page is full, `fillerRows = []`
 * * When the page is not full, `fillerRows = [0, ..., pageSize - page.length]`
 * 
 * This can be mapped to render dummy `<tr>` elements and keep the table size
 * unchanged in the last page.
 */
module.exports.useFillerRows = require("./useFillerRows");

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
 */
module.exports.useSelectSingleRow = require("./useSelectSingleRow");

/**
 * react-table hook to allow user to switch pages using mouse wheel 
 */
module.exports.useWheelPaging = require("./useWheelPaging");