class MockDB {

    constructor() {
        this.queryStack = [];
    }

    pushQueryResult(rs) {
        this.queryStack.push(rs);
    }

    reset() {
        this.queryStack = [];
    }

    async execQuery(stmt: string, params: Array): Promise<ResultSet> {
        if( this.queryStack.length > 0 ) {
            return this.queryStack.pop();
        }
        else {
            return {
                rows : []
            }
        }
    }
}

export default MockDB;