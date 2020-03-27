// var fs = require('fs'),
//     http = require('http');

// http.createServer(function (req, res) {
//   fs.readFile('./out/index.html', function (err,data) {
//     if (err) {
//       res.writeHead(404);
//       res.end(JSON.stringify(err));
//       return;
//     }
//     res.writeHead(200);
//     res.end(data);
//   });
// }).listen(8080, () => console.log("server is listening at port 8080"));

var fs = require('fs');

var http = require('http');

var nStatic = require('node-static');

var fileServer = new nStatic.Server('./out');

var pageview = require('./views.json');
console.log(typeof pageview.count);
http.createServer(function (req, res) {
    console.log(pageview);
    pageview.count++;
    console.log(pageview);
    fs.writeFileSync('./views.json', JSON.stringify(pageview));
    fileServer.serve(req, res);

}).listen(8080);