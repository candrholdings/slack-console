!function () {
    'use strict';

    var SlackConsole = function (options) {
            options || (options = {});

            var that = this;

            that.options = options;
        },
        CONSOLE_COMMANDS = [
            'debug',
            'info',
            'log',
            'warn',
            'error'
        ],
        EMOJICONS = {
            debug: 'bug',
            info: 'notes',
            warn: 'warning',
            error: 'exclamation'
        };

    SlackConsole.prototype.set = function (name, value) {
        this.options[name] = value;
    };

    CONSOLE_COMMANDS.forEach(function (name) {
        SlackConsole.prototype[name] = function (message, callback) {
            return this._send(name, message, callback);
        };
    });

    SlackConsole.prototype._send = function (type, message, callback) {
        var that = this,
            emoji = EMOJICONS[type] || '';

        that._api(
            'chat.postMessage',
            {
                channel: that.options.channel,
                text: (emoji && (':' + emoji + ': ')) + message,
                username: 'Console'
            },
            callback
        );
    };

    SlackConsole.prototype._api = function (method, params, callback) {
        if (arguments.length < 3) {
            callback = params;
            params = null;
        }

        var that = this,
            xhr = new XMLHttpRequest(),
            querystring = '?' + Object.getOwnPropertyNames(params || {}).reduce(function (curr, name) {
                var value = params[name];

                name !== 'token' && curr.push(value ? name + '=' + encodeURIComponent(value) : name);

                return curr;
            }, ['token=' + encodeURIComponent(that.options.token)]).join('&');

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) { return; }

            if (xhr.status === 200) {
                callback && callback(null, JSON.parse(xhr.response));
            } else {
                callback && callback(new Error(xhr.responseText));
            }
        };

        xhr.open('POST', 'https://slack.com/api/' + method + querystring, true);
        xhr.send();
    };

    var defaultInstance = new SlackConsole({});

    window.SlackConsole = SlackConsole;
    window.SlackConsole.set = defaultInstance.set.bind(defaultInstance);

    CONSOLE_COMMANDS.forEach(function (name) {
        SlackConsole[name] = defaultInstance[name].bind(defaultInstance);
    });

    window.SlackConsole.hijack = function () {
        var oldConsole = window.console;

        CONSOLE_COMMANDS.forEach(function (command) {
            var oldFn = oldConsole[command].bind(oldConsole);

            oldConsole[command] = function (arg0) {
                oldFn.apply(oldConsole, arguments);

                if (arg0 instanceof Error) {
                    SlackConsole[command].apply(SlackConsole, 'Exception `' + arg0.message + '`\n```' + arg0.stack + '```');
                } else {
                    SlackConsole[command].apply(SlackConsole, arguments);
                }
            };
        });

        window.addEventListener('error', function (err) {
            (err = err.error) && SlackConsole.error('Uncaught exception `' + err.message + '`\n```' + err.stack + '```');
        });
    };
}();