import Factory from "../../lib/Factory";

let db = null;
let dao = null;

class MockedFactory extends Factory {
    static setDBObject(mock) {
        db = mock;
    }

    static setDaoObject(mock) {
        dao = mock;
    }

    static getDBObject() {
        return db;
    }

    static getUserDao() {
        return dao;
    }

    static getLogger() {
        return Factory.getLogger();
    }

}

export default MockedFactory;