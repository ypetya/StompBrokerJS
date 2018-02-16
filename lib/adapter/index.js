var WebSocketServer = require('ws').Server;
var sockjs = require('sockjs');

/** 
 * Instantiating WebSocketServer by default
 * other options provide adapters
 */
module.exports = {
    ws: WebSocketServer,
    sockjs: SockJsAdapter
};

function SockJsAdapter(config) {
    var opts = Object.assign({}, config,
        {
            sockjs_url: "http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js",
            prefix: config.path || '/ws'
        });
    var sockjsServer = sockjs.createServer(opts);

    sockjsServer.installHandlers(opts.server, { prefix: opts.prefix });

    return {
        on: function(event, config) {
            if (event === 'connection') {
                sockjsServer.on('connection', function(conn) {
                    var cbPara = {
                        on: function(event, eventHandler) {
                            switch (event) {
                                case 'message':
                                    conn.on('data', eventHandler);
                                    break;
                                default:
                                    conn.on(event, eventHandler);
                            }
                        },
                        send: function(data, options) {
                            return conn.write(data);
                        }
                    };

                    config(cbPara);
                });
            } else throw 'No such event on sockjs adapter!';

        }
    };
}