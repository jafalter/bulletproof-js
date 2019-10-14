class MockRows {
    constructor(arr) {
        this.arr = arr;
    }

    item(index) {
        return this.arr[index];
    }
}

export default MockRows;