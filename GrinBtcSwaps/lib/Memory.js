const mem = {

};

class Memory {
    static setToMemory(key, val) {
        mem[key] = val;
    }

    static getFromMemory(key) {
        if( mem.hasOwnProperty(key) ) {
            return mem[key];
        }
        else {
            return null;
        }
    }
}

export default Memory;