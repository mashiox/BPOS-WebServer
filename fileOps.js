
exports.pathExists = function( path )
{
    return new Promise(function( resolve, reject ){
        require('fs').access( path, require('fs').F_OK, function( err ){
            if ( err ) reject( err );
            resolve( true );
        });
    });
}

exports.pathExistsSync = function( path )
{
    try 
    {
        return require('fs').accessSync( path, require('fs').F_OK ) === undefined;
    }
    catch ( err )
    {
        console.error( err );
        return false;
    }
}

exports.pathReadable = function( path )
{
    return new Promise(function( resolve, reject ){
        require('fs').access( 
            path, 
            require('fs').R_OK, 
            function( err ){
                if ( err ) reject( err );
                resolve( true );
            }
        )
    });
}

exports.pathReadableSync = function( path )
{
    try 
    {
        return require('fs').accessSync( path, require('fs').F_OK ) === undefined;
    }
    catch ( err )
    {
        console.error( err );
        return false;
    }
}

exports.getFileData = function( path, encoding )
{
    switch ( encoding )
    {
        case undefined:
            encoding = 'utf8';
            break;
    }
    return new Promise(function( resolve, reject ){
        require('fs').readFile( path, encoding, function( err, data ){
            if ( err ) reject( err );
            resolve( data );
        } );
    });
}

exports.getFileDataSync = function( path, encoding ) {  
    switch ( encoding )
    {
        case undefined:
            encoding = "utf8";
            break;
    }
    return require('fs').readFileSync( path, encoding );
}

exports.readDirectoryData = function( path )
{
    return require('fs').readdirSync( path )
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
