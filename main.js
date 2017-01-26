const http = require( 'http' );
const fs = require( 'fs' );

var fd = fs.readFileSync( './index.html', 'utf8' );

// var fileData = fs.readFile( './index.html', 'utf8', function( err, data ){
//     return new Promise(function( resolve, reject ){
//         console.log( "INC filedata" );
//         console.log( data );
//         if ( err ) reject( err );
//         resolve( data );
//     });
// });

const getFileData = function( path, encoding )
{
    switch ( encoding )
    {
        case undefined:
            encoding = 'utf8';
            break;
    }
    return new Promise(function( outerResolve, outerReject ){
        fs.readFile( path, encoding, function( err, data ){
            if ( err ) outerReject( err );
            outerResolve( data );
        } );
    });
}

const parsePath = function( url )
{
    return require('url').parse( url, true );
}

var server = http.createServer(function ( req, res ) {
    console.log( req.url );

    var pathData = parsePath( req.url );
    getFileData( pathData.pathname )
    .then(function( fileData ){
        res.writeHead( 200, { 'Content-Type': 'text/html' } );
        res.end( fd );
    })
    .catch(function( err ){
        console.log("error")
    });

});

 server.listen( 8080, function(){
    console.log("listening...")
});
