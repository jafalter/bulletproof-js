class Environment {

    /**
     * @return {boolean}
     */
    static isProduction() {
        return process.env.NODE_ENV === 'production';
    }
}

export default Environment;