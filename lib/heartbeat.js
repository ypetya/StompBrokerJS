function HeartBeat(stompServer) {
    this.interval = Infinity;
    this.timer = null;
    this.sessions = {};

    this.setup = function (socket) {
        this.update(socket);
        this._setupTimeoutChecking(socket.clientHeartBeat.client);
    };

    this.update = function (socket) {
        this.sessions[socket.sessionId] = wrapExpiry(socket);
    };

    this.stop = function () {
        if (this.timer) {
            clearInterval(this.timer);
        }
    };

    this._checkTimeouts = function () {
        var _updatedSessions = {};
        for (var sessionId in this.sessions) {
            var socket = this.sessions[sessionId];
            if (isExpired(socket)) {
                stompServer.conf.debug('HEART-BEAT', sessionId + ' expired!');
                stompServer.onDisconnect(socket);
                socket.close();
            } else {
                _updatedSessions[sessionId] = this.sessions[sessionId];
            }
        }
        this.sessions = _updatedSessions;
    }.bind(this);

    this._setupTimeoutChecking = function (newInterval) {
        if (newInterval > 0 && newInterval < this.interval) {
            this.interval = newInterval;
            if (this.timer) {
                clearInterval(this.timer);
            }
            this.timer = setInterval(this._checkTimeouts, this.interval);
            stompServer.conf.debug('HEART-BEAT', 'New timer for ' + this.interval + 'ms!');
        }
    };

    function wrapExpiry(socket) {
        if (socket.clientHeartBeat && socket.clientHeartBeat.client > 0) {
            socket.lastMessageReceivedTimeStamp = Date.now();
            stompServer.conf.debug('HEART-BEAT', socket.sessionId + ' : ' + socket.lastMessageReceivedTimeStamp);
        }
        return socket;
    }

    function isExpired(socket) {
        if (!socket || socket.clientHeartBeat.client === 0) return false;
        var errorMargin = socket.clientHeartBeat.client;
        var connectionValidTill = socket.lastMessageReceivedTimeStamp + socket.clientHeartBeat.client + errorMargin;
        return connectionValidTill < Date.now();
    }
}

module.exports = HeartBeat;