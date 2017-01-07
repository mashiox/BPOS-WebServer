const http = require( 'http' );
const fs = require( 'fs' );

var fd = fs.readFileSync( './index.html', 'utf8' );

var server = http.createServer(function ( req, res ) { 
    res.writeHead( 200, { 'Content-Type': 'text/html' } );
    res.end( fd );
 });
 server.listen( 8080, function(){
     console.log("listening...")
 })
