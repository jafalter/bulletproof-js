class User {

    static fromRow(row) {
        return new User(row.password_checksum);
    }

    constructor(checksum) {
        this._checksum = checksum;
    }

    get checksum() {
        return this._checksum;
    }
}

export default User