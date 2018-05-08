if (typeof io != 'undefined') {
    var serverConn = io.connect('/admin');
    var onClickReset = function() {
        serverConn.emit('reset', 1)
    };
    var onClickPause = function() {
        serverConn.emit('pause');
    };
    var onClickResume = function() {
        serverConn.emit('resume');
    };
}