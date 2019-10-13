class User {

    static fromRow(row) {
        return new User(row.password_checksum, row.seed);
    }

    constructor(checksum, seed) {
        this._checksum = checksum;
        this._seed = seed;
    }

    get checksum() {
        return this._checksum;
    }

    get seed() {
        return this._seed;
    }
}

export default User