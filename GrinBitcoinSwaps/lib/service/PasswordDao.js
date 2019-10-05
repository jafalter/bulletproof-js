import Password from "../model/Password";

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
     * @return {Promise<Password|null>}
     */
    async getPassword() {
        const rs = await this.db.execQuery("SELECT password FROM user;", []);
        const rows = rs.rows;
        if( rows.length === 0 ) { return null; }
        if( rows.length > 1 ) { throw new Error("Multiple passwords returned"); }
        else {
            this.logger.info("DB response", rs);
            return Password.fromRow(rows.item(0));
        }
    }
}

export default PasswordDao;