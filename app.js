var http = require('http')
var io = require('socket.io')();
var app = require('express')()
var util = require('util');
var fs=require('fs')

process.title = (process.cwd() + '\\' + process.argv.join(' '))

var settings=JSON.parse(fs.readFileSync('settings.json','utf-8'))

var rooms = {}
io.on('connection', function(socket) {
    console.log('a user connected');
    socket.emit('message', {
        obj: 'First data to send'
    })

    start()

    function start() {
        if (!getRoomName()) {
            console.log('discconet not roomname')
            socket.disconnect()

        } else {
            if (!rooms[getRoomName()]) rooms[getRoomName()] = 0
            rooms[getRoomName()]++
            
            console.log('user join to room:' + getRoomName())
            socket.join(getRoomName())
            socket.to(getRoomName()).emit('message', {
                    roomname: getRoomName(),
                    peopleInRoom: rooms[getRoomName()],
                    rooms: rooms
            })

            var watcher=''
            socket.on('watch',function(data){
            	console.log('Ask to watch file:' + data)
            	sendFile(data)
            	watcher=fs.watch(process.cwd() + '/' + data,function(){
            		sendFile(data)
            	})
            })
            socket.on('disconnect', function() {
            	console.log('unwatch file')
                rooms[getRoomName()]--
                if(watcher) watcher.close();
            })
        }
    }
    function sendFile(fileName){
		console.log('send new file')
		var content=fs.readFileSync(process.cwd() + '/' + fileName,'utf-8' )
		socket.emit('fileChange',content)
    }
    function getRoomName() {
        var referer = socket.handshake.headers.referer
        return referer && require('url').parse(referer).hostname
    }

});

io.listen(http.createServer(app).listen(settings.port ||80, settings.server));
console.log('listening')
