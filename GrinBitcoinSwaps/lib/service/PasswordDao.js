import User from "../model/User";

class PasswordDao {
    /**
     * @param db {Db}
     * @param logger {Logger}
     */
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }

    /**
     * Query password info stored locally
     * If no password has been saved yet, will return null
     *
     * @return {Promise<User|null>}
     */
    async getPasswordChecksum() {
        const rs = await this.db.execQuery("SELECT password_checksum FROM user;", []);
        const rows = rs.rows;
        if( rows.length === 0 ) { return null; }
        if( rows.length > 1 ) { throw new Error("Multiple passwords returned"); }
        else {
            this.logger.info("DB response", rs);
            return User.fromRow(rows.item(0));
        }
    }
}

export default PasswordDao;