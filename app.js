var http = require('follow-redirects').http,
	fs = require('fs'),
	jsdom = require("jsdom"),
	ProgressBar = require('progress');
function cleanString(str){ return str.text().toLowerCase().replace(/[|&;$%@"<>()+,]/g, ""); }
var myArgs = process.argv.slice(2)
if(myArgs[0]){
	var url = myArgs[0],
		res = /http\:\/\/www\.goear\.com\/listen\/(.[^\/]*)\/(.*)/g.exec(url),
		gid = res[1];
	jsdom.env(url,["http://code.jquery.com/jquery.js"], function (errors, window) {
		var song_title =  cleanString(window.$(".listen_header span.song_title")),
			song_artist = cleanString(window.$(".listen_header span.artist_name")),
			mp3File = song_artist+' - '+song_title+'.mp3',
			file = fs.createWriteStream(mp3File);
		http.get('http://www.goear.com/action/sound/get/'+gid, function (res) {
			var len = parseInt(res.headers['content-length'], 10);
			var bar = new ProgressBar('  downloading [:bar] :percent :etas', { complete: '=',incomplete: ' ',width: 20,total: len });
			res.pipe(file);
			res.on('data', function (chunk) {
				bar.tick(chunk.length);
			});
			res.on('end', function (chunk) {
		    	console.log(__dirname+'/'+mp3File.replace(/ /g,'\\ ')+'\n');
		  	});
		}).on('error', function (err) {
		  	console.error(err);
		});
	});
} else {
	console.log("usage: node app.js http://www.goear.com/listen/.../...");
}