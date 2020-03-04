var ws;

/**
 * 连接 websocket
 * @param func onopen要执行的函数，可以为空
 */
function ws_connect(func) {

    //ws://127.0.0.1:8001

    var ws_ip = "127.0.0.1:8001";
    ws = new WebSocket("ws://" + ws_ip);
    // 服务端主动推送消息时会触发这里的 onmessage
    ws.onmessage = function (e) {
        console.log('ws_onmessage: '+ (e.data ? e.data : ""));
    };
    ws.onopen = function (e) {
        console.log('ws_onopen');
        // 开启心跳
        ws_heart();
        if (typeof func == 'function') {
            func();
        }
    };
    ws.onerror = function (e) {
        console.error("ws_onerror:", e);
    };
    ws.onclose = function (e) {
        console.log('ws_onclose:code:' + e.code + ';reason:' + e.reason + ';wasClean:' + e.wasClean);
    };
}

$(function () {
    var func = function () {
        var data = {type: 'login'};
        ws.send(JSON.stringify(data));
    };
    // 页面加载时第一次连接，也可以传空
    ws_connect(func);
});





/**
 * 根据连接状态单线程连接 websocket
 * @param func onopen要执行的函数，可以为空
 */
function ws_execute(func) {
    console.log( ws );


    if (ws.readyState == 0) {
        // 正在链接中
        var _old$open = ws.onopen;
        ws.onopen = function (e) {
            // 原本 onopen 里的代码先执行完毕
            _old$open.apply(this, arguments);
            if (typeof func == 'function') {
                func();
            }
        };
    } else if (ws.readyState == 1) {


        // 已经链接并且可以通讯
        if (typeof func1 == 'function') {
            func1();
        }
    } else if (ws.readyState == 2) {
        // 连接正在关闭
        var _old$close = ws.onclose;
        ws.onclose = function (e) {
            // 原本 onclose 里的代码先执行完毕
            _old$close.apply(this, arguments);
            ws_connect(func);
        };
    } else if (ws.readyState == 3) {
        // 连接已关闭或者没有链接成功
        ws_connect(func);
    }
}


// 发送数据时，将代码构造成函数作为参数，等 onopen 时执行
var func1 = function () {
    var data = {type: 'audio'};
    ws.send(JSON.stringify(data));
};
ws_execute(func1);



var ws_heart_i = null;

/**
 * websocket 每X分钟发一次心跳
 */
function ws_heart() {
    if (ws_heart_i) clearInterval(ws_heart_i);
    ws_heart_i = setInterval(function () {
        console.log('ws_heart');
        var func = function () {
            var data = {type: 'ping'};
            ws.send(JSON.stringify(data));
        };
        ws_execute(func);
    }, 20000);
}