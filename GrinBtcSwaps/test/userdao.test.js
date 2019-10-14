import UserDao from "../lib/service/UserDao";
import MockDB from "./mocks/MockDB";
import Factory from "../lib/Factory";
import MockRows from "./mocks/MockRows";
import GBCrypto from "../lib/GBCrypto";

jest.mock('react-native-bip39', () => "bip39");

const db = new MockDB();
const userdao = new UserDao(db, Factory.getLogger());

describe('tests for the userdao module', () => {
    beforeEach(() => {
        db.reset();
    });

    test('Should retrieve password checksum from db', async () => {
        const checksum = "checksum";
        const seed = "seed";

        db.pushQueryResult({
            rows : new MockRows([
                {
                    password_checksum : checksum,
                    seed : seed
                }
            ])
        });

        const u = await userdao.getUserData();
        expect(u.seed).toBe(seed);
        expect(u.checksum).toBe(checksum);
    });

    test('Checksum test should succeed', async () => {
        const password = "password12";
        const checksum = GBCrypto.keccakSaltedHash(password);

        db.pushQueryResult({
            rows : new MockRows([
                {
                    password_checksum : checksum,
                    seed : null
                }
            ])
        });

        const result = await userdao.checkChecksum(password);
        expect(result).toBe(true);
    });

    test('Checksum test should fail', async () => {
        const password = "password12";
        const checksum = GBCrypto.keccakSaltedHash(password);

        db.pushQueryResult({
            rows : new MockRows([
                {
                    password_checksum : checksum,
                    seed : null
                }
            ])
        });

        const result = await userdao.checkChecksum(password + "abc");
        expect(result).toBe(false);
    });
});