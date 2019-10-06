import Environment from "./Environment";

const CONST_CREATE_SQL = `
CREATE TABLE IF NOT EXISTS user (
    id INT PRIMARY KEY,
    password_checksum VARCHAR(64)
);
`;

const CONST_DROP_SQL = `
DROP TABLE IF EXISTS user;
`;

class Db {

    /**
     * @param conn {WebSQLDatabase}
     * @param logger {Logger}
     */
    constructor(conn, logger) {
        this.conn = conn;
        this.isSetup = false;
        this.logger = logger;
    }

    /**
     * Create database tables if they don't exist
     *
     * @return {Promise<ResultSet>}
     */
    async setupDatabase() {
        if( !Environment.isProduction() && !process.env.PERSIST ) {
            this.logger.warn("Dropping old DB data");
            await this._executeQuery(CONST_DROP_SQL, []);
        }
        await this._executeQuery(CONST_CREATE_SQL, []);
        this.isSetup = true;
    }

    /**
     *
     * Optionally setup database and execute a SQLite statement
     *
     * @param stmt {string} sql statement
     * @param params {array} the params passed to the statement
     * @return {Promise<ResultSet>}
     */
    async execQuery(stmt, params) {
        if (!this.isSetup) {
            await this.setupDatabase();
        }
        return await this._executeQuery(stmt, params);
    }

    /**
     * Execute a SQLite statement, internal function should not be
     * called by another class, use execQuery instead
     *
     * @param stmt {string} sql statement
     * @param params {array} the params passed to the statement
     * @return {Promise<ResultSet>}
     */
    _executeQuery(stmt, params) {
        return new Promise((resolve, reject) => {
            this.conn.transaction((tx) => {
                tx.executeSql(stmt, params, (tx, results) => {
                    resolve(results);
                });
            }, (e) => {
                reject(e);
            })
        });
    }
}

export default Db