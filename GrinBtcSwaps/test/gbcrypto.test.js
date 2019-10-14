import GBCrypto from "../lib/GBCrypto";

jest.mock('react-native-bip39', () => ({
    generateMnemonic: () => {
        return new Promise((resolve)=> {
            resolve("crouch vintage travel visa develop volcano slice crumble together about shift vicious brick give keen");
        });
    },
    mnemonicToSeedHex: () => "256f15baef2bd1a39bedfcbfd45348e2971ac191fa6256654dce9e019ec689fd2c4cc43b1223d56cb28f77c72b350bde654601af0b6628fe875ca805931f799b"
}));

describe('Test for GBCrypto module', () => {
    beforeEach(() => {
        GBCrypto.resetEncryptionParams();
    });

    test('Checksum output is a valid hash output', () => {
        const output = GBCrypto.keccakSaltedHash('hello world');
        expect(output).toHaveLength(64);
        expect(output).toBe("f27308b1b7b50a35cacc216dfe099229dd42519c79a26ce819bd47582ebe75de")
    });

    test('Test encryption and decryption', () => {
        GBCrypto.setPassphrase("abc");
        const msg = "message";
        const cipher = GBCrypto.encryptMessage(msg);
        const plain = GBCrypto.decryptMessage(cipher);
        expect(plain).toBe(msg);
    });

    test('Test that decrypting does not work with a different key', () => {
        GBCrypto.setPassphrase("abc");
        const msg = "message";
        const cipher = GBCrypto.encryptMessage(msg);
        GBCrypto.setPassphrase("efg");
        const plain = GBCrypto.decryptMessage(cipher);
        expect(plain).not.toBe(msg);
    });

    test('That encryption without key setup fails', () => {
        expect(() => {
            GBCrypto.encryptMessage("msg")
        }).toThrow();
    });

    test('That decryption without key setup fails', () => {
        expect(() => {
            GBCrypto.decryptMessage("msg")
        }).toThrow();
    });

    test('That we get a mnemonic seed phrase', async () => {
       const phrase = await GBCrypto.genereteMnemonic();
       expect(phrase).toBe("crouch vintage travel visa develop volcano slice crumble together about shift vicious brick give keen");
       const seed = GBCrypto.seedFromMnemonic("crouch vintage travel visa develop volcano slice crumble together about shift vicious brick give keen");
       expect(seed).toBe("256f15baef2bd1a39bedfcbfd45348e2971ac191fa6256654dce9e019ec689fd2c4cc43b1223d56cb28f77c72b350bde654601af0b6628fe875ca805931f799b");
    });
});