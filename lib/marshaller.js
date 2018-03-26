/**
* @typedef {object} MsgFrame
* Message frame
* @param {MsgFrame} frame Message frame
* */
function marshaller(frame) {
    return {
        /** Serialize frame to string for send
         * @return {MsgFrame} modified frame
         * */
        serialize: function() {
            if (frame.body !== undefined) {
                frame.body = JSON.stringify(frame.body);
            }
            return frame;
        },

        /** Parse frame to object for reading
         * @return {MsgFrame} modified frame
         * */
        deserialize: function() {
            if (frame.body !== undefined) {
                try{
                    frame.body = JSON.parse(frame.body);
                } catch(e) {

                }
            }
            return frame;
        }
    }
}

module.exports = marshaller;
