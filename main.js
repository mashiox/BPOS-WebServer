const http = require( 'http' );
const fs = require( 'fs' );

const BPOS = {
    strOps: require( './strOps.js' ),
    fileOps: require( './fileOps.js' )
}

var config;

// Request is not for an empty directory. 
// returns a full filepath according
// to the config of where the root dir is.
const determineIndex = function( root, file )
{
    switch ( file )
    {
        case "":
        case "/":
            const index = config.indicies.map(function( idx ){
                return BPOS.strOps.urlify( root, idx )
            })
            .filter(function( path ){
                return BPOS.fileOps.pathExistsSync( path );
            })
            .filter(function( path ){
                return BPOS.fileOps.pathReadableSync( path );
            })
            if ( !index.length )
            {
                return "404! File not found!";
            }
            return index[0];
        break;
        default:
            const pathRequest = BPOS.strOps.urlify( root, file );
            if (
                BPOS.fileOps.pathExistsSync( pathRequest )
                && 
                BPOS.fileOps.pathReadableSync( pathRequest )
            )
            {
                return BPOS.strOps.urlify( root, file );
            }
    }
}

// Emit the raw data. from the file or directory.
const grokData = function( pathObj )
{
    var thisIndex = determineIndex( pathObj.root, pathObj.file );
    console.log( "__INDEX__" );
    console.log( thisIndex );
    try 
    {
        return BPOS.fileOps.getFileDataSync( thisIndex );
    }
    catch ( err )
    {
        console.log( err );
        switch ( err.code )
        {
            case undefined:
            case "ENOTDOR":
                return "404, Resource Not Found";
            case "ENOENT":
            case "EACCES":
                return "403, Unauthorized Access";
            default:
                console.warn( "Directory found, no index.");
                return readDirectoryData( pathObj.full );
        }
    }
}

var server = http.createServer(function ( req, res ) {

    if ( config )
    {
        console.log( req.url );
        var pathData = BPOS.strOps.parsePath( req.url );

        const fullSystemPath = BPOS.strOps.urlify( config.root, pathData.pathname );
        const pathObj = {
            full: BPOS.strOps.urlify( config.root, pathData.pathname ),
            root: config.root,
            file: pathData.pathname,
            query: Object.assign( {}, pathData.query )
        };
        // TODO need to catch the mime type of the file.
        // and use that in the content type.

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
