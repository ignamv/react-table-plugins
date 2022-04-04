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
 * @memberof module:hooks
 */
module.exports.useFillerRows = function (hooks) {
  function useInstance(instance) {
    const {
      state: { pageSize },
      page,
    } = instance;
    const actualRows = page.length;
    const missingRows = pageSize - actualRows;
    const fillerRows = [...new Array(missingRows).keys()];
    Object.assign(instance, { fillerRows });
  }
  hooks.useInstance.push(useInstance);
};
