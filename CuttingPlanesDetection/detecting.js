$(document).ready(function() {
    var imageField = document.getElementById("picture");
    var ctx = imageField.getContext('2d');
    
    var pictures = [];
    var lines = [];
    var mouseFlag = false;
    
    ClearDrawingArea();
    
    $("#picture").mousedown( MouseDrawStart );
    $("#picture").mousemove( MouseDraw );
    $(document).mouseup( MouseDrawEnd );
    $("#clearButton").click( ClearDrawingArea );
    $("#addingForm").submit( AddPicture );
    $("#resetButton").click( ResetData );
    
    function MouseDrawStart( event )
    {
        mouseFlag = true;
        ctx.fillRect(event.offsetX, event.offsetY, 5, 5);
    }
    
    function MouseDraw( event )
    {
        if (mouseFlag) {
            ctx.fillRect(event.offsetX, event.offsetY, 5, 5);
        }
    }
    
    function MouseDrawEnd( event )
    {
        mouseFlag = false;
    }
    
    function ClearDrawingArea()
    {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, imageField.width, imageField.height);
        ctx.fillStyle = "black";
    }
    
    function CountValue( point, coefficients)
    {
        var sum = 0;
        for (var i=0; i< point.length; i++) {
            sum +=point[i] * coefficients[i]; 
        }
        return sum;
    }
    
    function IsConflict( )
    {
        var newPictureNum = pictures.length - 1;
        var newPictureName = pictures[ newPictureNum].name;
        if (lines.length == 0) {
            for (var i=0; i< newPictureNum; i++ ) {
                if ( pictures[i].name != newPictureName ) {
                    return ( [i,newPictureNum] );
                }
            }
            return( [] );
        }
        for (var i=0; i < pictures.length; i++) {
            if ( pictures[i].name != newPictureName ) {
                for ( var j=0; j<lines.length; j++) {
                    if ( pictures[i].lineValues[j] == pictures[newPictureNum].lineValues[j] ) {
                        return( [i,newPictureNum] );
                    }
                }
            }
        }
        return( [] );
    }
    
    function CountPointSign( point, coefficients )
    {
        var sum = CountValue(point, coefficients);
        sum -= coefficients[ coefficients.length - 1 ];
        if (sum >= 0)
            return 1;
        return 0;
    }
    
    function UpdateLines( )
    {
        var len = pictures[0].coordinates.length;
        var conflictPoints = IsConflict( );
        var coefficients = [];
        var res1, res2;
        while (conflictPoints.length != 0 ) {
            for (var i=0; i<len; i++) {
                coefficients.push( Math.random() );
            }
            res1 = CountValue( pictures[ conflictPoints[0] ].coordinates, coefficients );
            res2 = CountValue( pictures[ conflictPoints[1] ].coordinates, coefficients );
            coefficients.push( Math.random() * (Math.max( res1, res2) - Math.min(res1, res2)) + Math.min( res1, res2));
            lines.push( coefficients );
            //            pictures[ conflictPoints[0] ].lineValues.push( {
            //                num: lines.length - 1, 
            //                value: CountPointSign( pictures[ conflictPoints[0] ].coordinates, coefficients)
            //            } );
            //            pictures[ conflictPoints[1] ].lineValues.push( {
            //                num: lines.length - 1, 
            //                value: CountPointSign( pictures[ conflictPoints[1] ].coordinates, coefficients)
            //            } );
            for (var i=0; i< pictures.length; i++) {
                pictures[i].lineValues.push( {
                    num: lines.length - 1,
                    value: CountPointSign( pictures[i].coordinates, coefficients)
                } );
            }
            conflictPoints = IsConflict();
        }
    }
    
    function AddPicture( )
    {
        pictures.push( {
            coordinates: MakingPixelMap(),
            name: $("#className").val(),
            lineValues: []
        } );
        var lastPicture = pictures.length - 1;
        for (var i=0; i<lines.length; i++) {
            pictures[ lastPicture ].lineValues.push( CountPointSign( pictures[lastPicture].coordinates, lines[i] ) );
        }
        UpdateLines();
        ClearDrawingArea();
    }
    
    function ResetData( )
    {
        pictures = [];
        lines = [];
        ClearDrawingArea();
        $("#numberOfClusters").val("");
        $("#outputDiv").text("");
    }
    
    function MakingPixelMap(  )
    {
        var map = [];
        var pixelMap = ctx.getImageData(0, 0, imageField.width, imageField.height).data;
        for (var i=0; i < pixelMap.length; i+=4) {
            if (pixelMap[i] == 255 && pixelMap[i+1] == 255 && pixelMap[i+2] == 255) { 
                map.push(0);
            } else {
                map.push(1);
            }   
        }
        return map;
    }

}
);

