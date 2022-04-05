
const lib = require('./index');

const functions = [
    'useFillerRows',
    'useWheelPaging',
    'useSelectSingleRow',
    'SelectColumnFilter',
    'TableHead',
    'TableBodyRows',
];

functions.forEach(name => {
    test(`${name} is function`, () => {
        expect(typeof lib[name]).toBe('function');
    })
})