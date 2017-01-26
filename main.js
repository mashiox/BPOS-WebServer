const http = require( 'http' );
const fs = require( 'fs' );

var config;

const pathExists = function ( path )
{
    return new Promise(function( resolve, reject ){
        fs.access( path, fs.F_OK, function( err ){
            if ( err ) reject( err );
            resolve( true );
        });
    });
}

const pathExistsSync = function( path )
{
    try 
    {
        return fs.accessSync( path, fs.F_OK ) === undefined;
    }
    catch ( err )
    {
        console.error( err );
        return false;
    }
}

const pathReadable = function( path )
{
    return new Promise(function( resolve, reject ){
        fs.access( path, fs.R_OK, function( err ){
            if ( err ) reject( err );
            resolve( true );
        })
    });
}

const pathReadableSync = function( path )
{
    try 
    {
        return fs.accessSync( path, fs.F_OK ) === undefined;
    }
    catch ( err )
    {
        console.error( err );
        return false;
    }
}

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

    if ( config )
    {
        var loadFile;
        var pathData = parsePath( req.url );
        
        switch ( pathData.href )
        {
            case "":
            case "/":
                const index = config.indicies.map(function(index){
                    return config.root
                           + ( config.root[config.root.length-1] === "/" ? "" : "/" )
                           + index;
                })
                .filter(function( path ){
                    return pathExistsSync( path );
                })
                .filter(function( path ){
                    return pathReadableSync( path );
                })
                if ( !index.length )
                {
                    res.end("couldnt load");
                }
                loadFile = index[0];

            break;
        }
        

        getFileData( loadFile )
        .then(function( fileData ){
            res.writeHead( 200, { 'Content-Type': 'text/html' } );
            res.end( fileData );
        })
        .catch(function( err ){
            console.log( err );
        });
    }

});

 server.listen( 8080, function(){
    console.log("listening...")
    const cfg = JSON.parse(
        fs.readFileSync( './bpos-config.json' )
    );
    config = Object.assign( {}, cfg );
});
