$(document).ready(function() {
    var imageField = document.getElementById("picture");
    var ctx = imageField.getContext('2d');
    
    var pictures = [];
    var lines = [];
    var linesNumber = 0;
    var mouseFlag = false;
    
    ClearDrawingArea();
    
    $("#picture").mousedown( MouseDrawStart );
    $("#picture").mousemove( MouseDraw );
    $(document).mouseup( MouseDrawEnd );
    $("#clearButton").click( ClearDrawingArea );
    $("#addingForm").submit( AddPicture );
    $("#resetButton").click( ResetData );
    $("#recognizeButton").click( Recognize );
    $("#updateTableButton").click( RemoveExcess );
    
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
                    if ( pictures[i].lineValues[j].value == pictures[newPictureNum].lineValues[j].value ) {
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
            lines.push( {
                num: linesNumber, 
                value: coefficients
            } );
            linesNumber++;
            for (var i=0; i< pictures.length; i++) {
                pictures[i].lineValues.push( {
                    num: linesNumber - 1,
                    value: CountPointSign( pictures[i].coordinates, coefficients)
                } );
            }
            conflictPoints = IsConflict();
        }
    }
    
    function Compare( picture1, picture2, exeption)
    {
        var flag = true;
        for (var i = 0; i < lines.length; i++) {
            if (picture1.lineValues[i].num != exeption ) {
                flag = flag && (picture1.lineValues[i].value == picture2.lineValues[i].value);
            }
        }
        return flag;
    }
    
    function RemoveLine( num )
    {
        lines.splice( num, 1 );
        for (var i = 0; i < pictures.length; i++ ) {
            pictures[i].lineValues.splice( num, 1 );
        }
    }
    
    function RemoveExcessLines()
    {
        var i = 0;
        var flag;
        while ( i < lines.length ) {
            flag = true;
            for (var j=0; j< pictures.length; j++) {
                for (var k=j+1; k < pictures.length; k++) {
                    if (pictures[k].name != pictures[j].name) {
                        flag = flag && !Compare( pictures[k], pictures[j], i );
                    }
                    
                }
            }
            if (!flag) {
                RemoveLine( i );
            } else {
                i++;
            }
        }
    }
    
    function RemoveExcessExamples()
    {
        var i = 0, j;
        while ( i < pictures.length ) {
            j = i + 1;
            while ( j<pictures.length ) {
                if ( (pictures[i].name == pictures[j].name) && (Compare(pictures[i], pictures[j], linesNumber) ) ) {
                    pictures.splice( j,1 );
                } else j++;
            }
            i++;
        }
    }
    
    function UnsignCompare( picture1, picture2 )
    {
        var flag = true;
        for (var i = 0; i < lines.length; i++) {
            if (picture1.lineValues[i].insign != 1 ) {
                flag = flag && (picture1.lineValues[i].value == picture2.lineValues[i].value);
            }
        }
        return flag;
    }
    
    function MakingUnsign( )
    {
        var flag;
        for (var i=0; i < pictures.length; i++) {
            for (var j = 0; j < lines.length; j++ ) {
                flag = true;
                pictures[i].lineValues[j].insign = 1;
                for (var k = 0; k < pictures; k++) {
                    if ( pictures[k].name != pictures[i].name ) {
                        flag = flag && !( UnsignCompare(pictures[i], pictures[j]) );
                    }
                }
                if (!flag) {
                    pictures[i].lineValues[j].insign = 0;
                }
            }
        }
    }
    
    function RemoveExcess( )
    {
        RemoveExcessLines();
        RemoveExcessExamples();
        MakingUnsign();
        
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
            pictures[ lastPicture ].lineValues.push( {
                num: lines[i].num,
                value: CountPointSign( pictures[lastPicture].coordinates, lines[i].value ),
                insign: 0
            });
        }
        UpdateLines();
        ClearDrawingArea();
    }
    
    function Recognize( )
    {
        
        var newPicture = { coordinatres: MakingPixelMap(),
            lineValues: [] }  ;
        for (var i = 0; i<lines.length; i++ ) {
            newPicture.lineValues.push( {num: lines[i].num,
            value: CountPointSign( newPicture.coordinates, lines[i].value ) });
        }
        for (var i=0; i<pictures.length; i++) {
            if ( UnsignCompare( pictures[i], newPicture) ) {
                alert("Изображение относится к фигуре "+pictures[i].name);
                return;
            }
        }
    }
    
    function ResetData( )
    {
        pictures = [];
        lines = [];
        ClearDrawingArea();
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

});