const http = require( 'http' );
const fs = require( 'fs' );

var config;

String.prototype.reverse = function()
{
    return this.split( "" )
               .reverse()
               .join( "" );
}

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

const getFileDataSync = function( path, encoding ) {  
    switch ( encoding )
    {
        case undefined:
            encoding = "utf8";
            break;
    }
    return fs.readFileSync( path, encoding );
}

const parsePath = function( url )
{
    return require('url').parse( url, true );
}

const emitTrailingSlash = function( string )
{
    return string 
        + ( string[string.length-1] === "/" ? "" : "/" );
}

// join s.t. we have a req that looks like
// "/one/two"
const urlify = function( one, two )
{
    if ( !one.length ) return emitTrailingSlash( two.reverse() ).reverse();
    if ( undefined === two || !two.length ) return emitTrailingSlash( one );

    switch ( one[one.length-1] )
    {
        case "/":   // one has slash.
            switch ( two[0] )
            {
                case "/":   // two has slash
                    return one + g.substr( 1, g.length-1 );
                default:    // two has no slash
                    return one.substr( 0, one.length-1 ) + two;
            }
        break;

        default:    // one has no slash.
            switch ( two[0] )
            {
                case "/":   // two has slash
                    return one + two;
                default:    // two has no slash
                    return one + "/" + two;

            }
      //break default
    }

}

const readDirectoryData = function( path )
{
    return fs.readdirSync( path )
        .map(function(filename){
            return (
                    "<a href='" 
                + filename
                + "'>"
                + filename
                + "</a>"
            );
        })
        .join( "<br>" );
}

// Request is not for an empty directory. 
// returns a full filepath according
// to the config of where the root dir is.
const determineIndex = function( root, file )
{
    switch ( file )
    {
        // Default case. Assumes the request is for the index 
        // file in the directory. 
        case "":
        case "/":
            const index = config.indicies.map(function( idx ){
                return urlify( root, idx )
            })
            .filter(function( path ){
                return pathExistsSync( path );
            })
            .filter(function( path ){
                return pathReadableSync( path );
            })
            if ( !index.length )
            {
                return "404! File not found!";
            }
            return index[0];
        break;
        default:
            const pathRequest = urlify( root, file );
            if (
                pathExistsSync( pathRequest )
                && 
                pathReadableSync( pathRequest )
            )
            {
                return urlify( root, file );
            }
    }
}

// Emit the raw data. from the file or directory.
const grokData = function( pathObj )
{
    var thisIndex = determineIndex( pathObj.root, pathObj.file );
    try 
    {
        return getFileDataSync( thisIndex );
    }
    catch ( err )
    {
        switch ( err.code )
        {
            case "ENOTDOR":
                return "404, file not found.";
            case undefined:
                return "XXX, file does not exist";
            case "ENOENT":
            case "EACCES":
                return "503, can't read file";
            default:
                console.warn( "Directory found, no index.");
                return readDirectoryData( pathObj.full );
        }
    }
}

var server = http.createServer(function ( req, res ) {

    if ( config )
    {
        var pathData = parsePath( req.url );

        const fullSystemPath = urlify( config.root, pathData.href );
        const pathObj = {
            full: urlify( config.root, pathData.href ),
            root: config.root,
            file: pathData.href
        };

        var fileData = grokData( pathObj );

        res.writeHead( 200, { 'Content-Type': 'text/html' } );
        res.end( fileData );

    }

});

 server.listen( 8080, function(){
    console.log("listening...")
    const cfg = JSON.parse(
        fs.readFileSync( './bpos-config.json' )
    );
    config = Object.assign( {}, cfg );
});
