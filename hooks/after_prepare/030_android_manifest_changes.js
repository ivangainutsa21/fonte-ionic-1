    module.exports = function (context) {


 var permissionsToRemove = [ "READ_PHONE_STATE", "SEND_SMS", "ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION" ];


    var fs = require('fs');
    var path = require('path');
var platformRoot = path.join(context.opts.projectRoot, 'platforms/android');


var manifestFile = path.join(platformRoot, 'AndroidManifest.xml');

    fs.readFile( manifestFile, "utf8", function( err, data )
    {
        if (err)
            return console.log( err );

        var insertAt = data.indexOf("</manifest>");

        var optionalFeatures = "<uses-feature android:name=\"android.hardware.LOCATION\" android:required=\"false\"/><uses-feature android:name=\"android.hardware.location.NETWORK\" android:required=\"false\"/>";

        // var result = data.slice(0, insertAt) + optionalFeatures + data.slice(insertAt);

        // fs.writeFile(manifestFile, result, 'utf8', function (err) {
        //     if (err) throw new Error('Unable to write into AndroidManifest.xml: ' + err);
        // });




        result = data.slice(0, insertAt) + optionalFeatures + data.slice(insertAt);
        for (var i=0; i<permissionsToRemove.length; i++)
            result = result.replace( "<uses-permission android:name=\"android.permission." + permissionsToRemove[i] + "\" />", "" );
            result = result.replace( "<uses-feature android:name=\"android.hardware.location.gps\" />", "" );

        fs.writeFile( manifestFile, result, "utf8", function( err )
        {
            if (err)
                return console.log( err );
        } );



    });
    }

