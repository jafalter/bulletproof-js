import Db from "./Db";
const cnf = require('./res/config');

import * as SQLite from 'expo-sqlite';
import UserDao from "./service/UserDao";
import Logger from "./Logger";

let db = null;
let logger = null;

class Factory {

    /**
     * Get application configurations
     *
     * @return {{}}
     */
    static getConfig() {
        return cnf;
    }

    /**
     *
     * @return {Logger}
     */
    static getLogger() {
        if( logger === null) {
            logger = new Logger(cnf.logger.level);
        }
        return logger;
    }

    /**
     * Database object to access local sqlite database
     *
     * @return {WebSQLDatabase}
     */
    static getDBConnection() {
        return SQLite.openDatabase(Factory.getConfig().database.name);
    }

    /**
     * Return
     *
     * @return {Db}
     */
    static getDBObject() {
        if( db === null ) {
            db = new Db(Factory.getDBConnection(), this.getLogger());
        }
        return db;
    }

    /**
     * Database Access Object for the User Model
     *
     * @return {UserDao}
     */
    static getUserDao() {
        return new UserDao(Factory.getDBObject(), Factory.getLogger());
    }
}

export default Factory;