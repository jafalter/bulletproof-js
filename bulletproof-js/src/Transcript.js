class Transcript {

    constructor() {
        this.points = [];
    }

    /**
     * @param p {Point}
     */
    addPoint(p) {
        this.points.push(p);
    }

    /**
     * Serialize the transcript to
     * a hex decoded string
     *
     * @return {string}
     */
    toString() {
        if( this.points.length === 0 ) {
            throw new Error("Can't serialize empty transcript");
        }
        else {
            let str = "";
            for(let i = 0; i < this.points.length; i++ ) {
                str += this.points[0].encode('hex');
            }
            return str;
        }
    }
}

module.exports = Transcript;