var ws = require("nodejs-websocket");
var fs = require('fs')
var fileName='';
path=[];
var obj = "";

console.log("开始建立连接...")

var broadcast = [];

//定义函数去掉重复广播
function uniqbroadcast(arr, name){
        var hash = {};
        return arr.reduce(function (item, next) {
            hash[next[name]] ? '' : hash[next[name]] = true && item.push(next);
            return item;
        }, []);
    }

var server = ws.createServer(function(conn){

    //文件目录
    function sendFiles(){
        let files=fs.readdirSync(__dirname + '/guestStorge/'+path.join('/'));
        let response={};
        let components = [];
        files.forEach(function (item, index) {
            let stat = fs.lstatSync(__dirname + "/guestStorge/" + item)//path.join('/')+'/'+
            let file={}
            file.name=item;
            if (stat.isDirectory() === true) {
                file.type="dir";
            }else if(stat.isFile() === true){
                file.type="file";
            }
            components.push(file)
        })
        response.path=path;
        response.files=components;
        response.type='cd'
        conn.sendText(JSON.stringify(response));
    }
    console.log('New connection')
    sendFiles();
    //接收文件
    conn.on("binary",function(inStream){

        var data = Buffer.alloc(0)
        console.log(inStream)
        inStream.on("readable", function () {
            var newData = inStream.read()
            if (newData)
                data = Buffer.concat([data, newData], data.length+newData.length)
        })
        inStream.on("end", function () {
            console.log("Received " + data.length + " bytes of binary data")
            console.log(data)
            fs.writeFile( __dirname +'/guestStorge/'+ fileName, data, (err) => {
                if (err) throw err;
                console.log('文件已保存');
                let response={};
                response.message="文件已保存";
                response.type='message';

                obj.fileName = fileName;
                obj.filePath = 'http://45.40.194.70:8002/'+ fileName

                broadcast = uniqbroadcast(broadcast,"id");//去掉重复广播

                broadcast.forEach(function(index){
                    index.conn.sendText(JSON.stringify(obj));
                    index.conn.sendText(JSON.stringify(response));
                })

            });
        })
    });

    conn.on("text", function (str) {
        console.log("收到的信息为:"+str);

		obj = eval('(' + str + ')');

        fileName = (obj.name ? obj.name : "");

        if(obj.id && obj.msg){
            //发送广播
        	broadcast.forEach(function(index){
				index.conn.sendText(str);
			})

        }else{
            //添加广播




            if(broadcast.length > 0){


                for(let i in broadcast){

                    broadcast[i].conn.sendText(str);

                    if(broadcast[i].id != obj.id){
                        broadcast.push({
                            id : obj.id,
                            conn : conn
                        })
                    }
                }
            }else {
                broadcast.push({
                    id : obj.id,
                    conn : conn
                })
            }


        	conn.sendText(str)
        }

    })
    conn.on("close", function (code, reason) {
        console.log("关闭连接")
    });
    conn.on("error", function (code, reason) {
        console.log("异常关闭")
    });
}).listen(8001)
console.log("WebSocket建立完毕")


