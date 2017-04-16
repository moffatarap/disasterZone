// Utility class to collate functions that effect JS as a whole

String.prototype.toTitleCase = function( selector ) {

    // array of string split into sections to capitalise based on selector
    var splitArray;
    var finalString = "";
    if ( typeof ( selector ) === 'undefined' ) {
        selector = " ";
        splitArray = this.split ( " " ) ;
    } else {
        splitArray = this.split ( selector ) ;
    }

    splitArray.forEach( function( element ) {
        finalString += element[0].toUpperCase() + element.substr(1) + selector;
    } );
    finalString = finalString.substr( 0, finalString.length-1);
    return finalString;
    

}