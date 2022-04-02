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
