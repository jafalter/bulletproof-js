class Password {

    static fromRow(row) {
        return new Password(row.password);
    }

    constructor(hash) {
        this._hash = hash;
    }

    get hash() {
        return this._hash;
    }
}

export default Password