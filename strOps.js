
exports.reverse = function( string )
{
    return string.split( "" )
                    .reverse()
                    .join( "" );
}

exports.parsePath = function( url )
{
    return require('url').parse( url, true );
}

exports.emitTrailingSlash = function( string )
{
    return string 
        + ( string[string.length-1] === "/" ? "" : "/" );
}

exports.urlify = function( one, two )
{
    if ( !one.length ) return this.emitTrailingSlash( two.reverse() ).reverse();
    if ( undefined === two || !two.length ) return this.emitTrailingSlash( one );

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

