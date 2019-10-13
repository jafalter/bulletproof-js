import User from "../model/User";
import Crypto from "../Crypto";

class UserDao {
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
    async getUserData() {
        const rs = await this.db.execQuery("SELECT password_checksum FROM user WHERE id = 1;", []);
        const rows = rs.rows;
        if( rows.length === 0 ) { return null; }
        if( rows.length > 1 ) { throw new Error("Multiple passwords returned"); }
        else {
            this.logger.info("DB response", rs);
            return User.fromRow(rows.item(0));
        }
    }

    /**
     * Verify a entered password
     *
     * @param password {string} password provided in plain text
     * @return {Promise<boolean>}
     */
    async checkChecksum(password) {
        const checksum = Crypto.keccakSaltedHash(password);
        const data = await this.getUserData();
        return checksum === data.checksum;
    }

    /**
     * Create a new password checksum and save to storage
     *
     * @param password {string} password in plain text
     * @return {Promise<void>}
     */
    async setPasswordChecksum(password) {
        const checksum = Crypto.keccakSaltedHash(password);
        this.logger.info("New checksum " + checksum);
        await this.db.execQuery('INSERT OR REPLACE INTO user(id, password_checksum) VALUES(?,?);', [1, checksum]);
    }
}

export default UserDao;