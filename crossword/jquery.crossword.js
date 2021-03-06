/*=================================================================================== 
	jQuery Crossword Puzzle Plugin
	http://www.david-sherman.com/projects/jqcw/intro.html
	version 1.0
===================================================================================*/ 


var  _cwo =  { };

(function( $ ){
  $.fn.crossword = function( options )
  {

	/*=================================================================================== 
	use global _cwo CrossWord Object to store the puzzle, the clues a few commonly used 
	items,	and some parameters that can be easily changed  
	===================================================================================*/ 
	
	$.extend( _cwo, options );
	
	// don't change these 
	
	_cwo.nSize   			= _cwo.puzzle.row.length;   
	_cwo.NA 				= "_NA_";
	_cwo.BLACKCELL 			= "_";
	
	// adjust these as desired to control starting position and direction, and current cell color 
	
	_cwo.currCell 			= "#C0101";
	_cwo.currRow			= "1";
	_cwo.currCol			= "1";
	_cwo.direction 			= "across";

    // Add in the accent buttons
    var accents = "ÄÉÖÜß";
    for (var i = 0; i < accents.length; i++) {
        var accent = accents[i];

        var accentList = $("#accents ul");

        var newAccentButton = $("<li>" + accent + "</li>");
        newAccentButton.click((function(a) { 
                return function() { insertSymbol(a); }
            })(accent));


        accentList.append(newAccentButton);
    }

	/*=================================================================================== 
	   Build the puzzle inside a standard HTML table.  Each <td> in the table is assigned
	   a unique id attribute.  After the table is constructed, replace the HTML of the 
	   target container with the table, then adjust the height and width of each cell in 
	   the table so that the puzzle fits in its container. 
	===================================================================================*/ 
	    
	_tableRows   = "<caption>" + _cwo.title + "</caption>";
	_number = 1;
	cellSize =    ( Math.floor( $(_cwo.puzzleContainer).width() /  _cwo.nSize ) ) - 2;
	for ( rowIndex  = 0; rowIndex < _cwo.nSize; rowIndex++ )
	{
		tr  = "";
		for ( cIndex = 0; cIndex < _cwo.nSize; cIndex++ )
		{
			c = _cwo.puzzle.row[rowIndex].substring( cIndex, cIndex + 1 )
			id = cellID( rowIndex,  cIndex );
 			div  = makeElement( "div", ( c == _cwo.BLACKCELL ? "cwBlackCell" : "cwCell"), id, " "  );
 			numDiv =  makeElement( "div", "cwNumber", "N" + id,  "" )		
  			tr = tr + makeElement( "td", "", "", numDiv + div)
		}
		_tableRows = _tableRows + makeElement( "tr", "cwRow", "", tr );
	 }

	$(_cwo.puzzleContainer ).html( makeElement( "table", "cwTable", "", _tableRows ) );	

	$(".cwCell,.cwBlackCell").width( cellSize  );
	$(".cwCell,.cwBlackCell").height( cellSize );
	
	/*=================================================================================== 
	  Use the JQuery Data feature to associate the following pieces of information with
	  each table cell:  the correct answer, the current value entered by the user, the cell
	  clue number ( or zero ), and row /column data 
	===================================================================================*/ 
	
	for ( rowIndex  = 0; rowIndex < _cwo.nSize; rowIndex++ )
	{
 		for ( cIndex = 0; cIndex < _cwo.nSize; cIndex++ )
		{
			var c = _cwo.puzzle.row[rowIndex].substring( cIndex, cIndex + 1 )
			var id = "#" + cellID( rowIndex,  cIndex );
            var numberCell = false;
            /*if ( c != _cwo.BLACKCELL )*/
            /*{				*/
            /*if ( ( rowIndex == 0 ) || ( cIndex == 0 ) ) numberCell = true;*/
            /*if ( ( cIndex > 0 )&& ( _cwo.BLACKCELL  == _cwo.puzzle.row[rowIndex].substring( cIndex-1, cIndex  )) ) numberCell = true;*/
            /*if ( ( rowIndex > 0 )&& ( _cwo.BLACKCELL == _cwo.puzzle.row[rowIndex-1].substring( cIndex, cIndex+1  )) ) numberCell = true;*/
            /*}*/

            for (var i = 0; i < _cwo.nums.length; i++) {
                num = _cwo.nums[i];
                // Horribly inefficent way of doing this but whatever.  Fix later
                if (num['x'] == cIndex && num['y'] == rowIndex) {
                    numberCell = true;
                    _number = num['num'];
                    break;
                }
            }

			$(id).data("answer", c );
			$(id).data("player", " "  );
			$(id).data("number",  ( numberCell ? _number++ : 0  ) );  
			$(id).data( "row", rowIndex);
			$(id).data( "col", cIndex);
			
			paintCell ( id, 'player');
		}	 
	}

	//Set up clue displays and bind a few events
	
	setUpClues( _cwo.acrossContainer, _cwo.clues.across, "A" );
	setUpClues( _cwo.downContainer, _cwo.clues.down, "D" );

	$('.cwCell').click( function( event ){ cellClick( event )} );
 	$('#Aselector').change( function( event ) { clueClick( event )}  );
 	$('#Dselector').change( function( event ) { clueClick( event )}  );
 	
	$('*').bind('keyup',function( event ){ keyUp( event ) } );

	// Attach functionality to buttons..

	$(_cwo.revealButton ).bind('click',function( event, ui ){ paintPuzzle( 'answer') } );
	$(_cwo.hideButton ).bind('click',function( event, ui ){ paintPuzzle( 'player' ) } );
	$(_cwo.clearButton ).bind('click',function( event, ui ){ clearPuzzle() } );
	$(_cwo.checkButton ).bind('click',function( event, ui ){ checkPuzzle() } );
    $(_cwo.hintButton ).bind('click',function( event, ui ) { giveHint() } );

  };
})( jQuery );


	/*=================================================================================== 
	  Support functions  
	===================================================================================*/ 


function cellID ( row, col )  {  return "C" + (row*1000  + col) };
function answer( row, col ) { return $("#" + cellID( row,col ) ).data("answer") }; 
function isNumber(row, col) { return ($("#" + cellID( row,col ) ).data("number") != ''); };

function isCellLeftValid(row, col) {
    if (col <= 0) return false;
    return answer(row, col - 1) != _cwo.BLACKCELL;
}
function isCellRightValid(row, col) {
    if (col >= _cwo.nSize) return false;
    return answer(row, col + 1) != _cwo.BLACKCELL;
}
function isCellAboveValid(row, col) {
    if (row <= 0) return false;
    return answer(row - 1, col) != _cwo.BLACKCELL;
}
function isCellBelowValid(row, col) {
    if (row >= _cwo.nSize) return false;
    return answer(row + 1, col) != _cwo.BLACKCELL;
}


function keyUp( event )
{
	if ( event.currentTarget.tagName  !=  "HTML" )  return;
	
	if ( event.which   == 37 ) goAcross( true );
	if ( event.which == 38 ) goDown( true );
	if ( event.which == 39 ) goAcross( false );
	if ( event.which == 40 ) goDown( false);
	if ( 
		( 32 ==  event.which  ) ||
		( ( 64 < event.which  ) && ( event.which < 91 ) )  ||
		( ( 96 < event.which  ) && ( event.which < 123 ) ) 
		)
	{
		_char = codeToChar( event.which );
		if ( _char == _cwo.NA ) return;
		$( _cwo.currCell).data( 'player', _char );
		paintCell( _cwo.currCell, 'player');
		if ( _cwo.direction == 'across') { goAcross( false ) } else goDown()
	}
	$("#" + cellID( _cwo.currRow, _cwo.currCol )).click();

};

function insertSymbol(symbol) 
{
	$( _cwo.currCell).data( 'player', symbol );
	paintCell( _cwo.currCell, 'player');
	if ( _cwo.direction == 'across') { goAcross( false ) } else goDown()
	$("#" + cellID( _cwo.currRow, _cwo.currCol )).click();
}

function cellClick( event )
{
    id = "#" + event.currentTarget.id;

    row = $(id).data('row');
 	col = $(id).data('col');

    // If direction is across but user clicks on a cell with no 
    //  left or right cells AND the cell is a number, the user
    //  probably wants to go DOWN and finish the word.  
    // Same with the vertical
    if (_cwo.direction == "across" &&
        isCellLeftValid(row, col) == false &&
        isCellRightValid(row, col) == false &&
        isNumber(row, col))
    {
        _cwo.direction = 'down';
    } else if
       (_cwo.direction == "down" &&
        isCellAboveValid(row, col) == false &&
        isCellBelowValid(row, col) == false &&
        isNumber(row, col))
    {
        _cwo.direction = 'across';
    } 
    /*
       * BUGGY?
    else if (_cwo.currRow == row && _cwo.currCol == col) 
    {
        // User clicked the same cell as the current selection.  Perhaps
        //  they want to change direction
        if (_cwo.direction == "across") {
            if (isCellAboveValid(row, col) || isCellBelowValid(row, col)) {
                _cwo.direction = "down";
            }
        } else {
            if (isCellLeftValid(row, col) || isCellRightValid(row, col)) {
                _cwo.direction = "across";
            }
        }

    }
    */

	moveToCell( "#" + event.currentTarget.id );

	alignClue(  "A", _cwo.clues["across"]  );  
	alignClue(  "D", _cwo.clues["down"]  );  
};

function clueClick( event )
{
	$("#Aselector").blur();
	$("#Dselector").blur();


    if (event.target.id == 'Aselector') {
        // Across clue clicked

	    clueIndex = event.target.selectedIndex;
    	clueNumber =  _cwo.clues["across"][clueIndex].no;
	    _cwo.direction = 'across';
    } else {
        // Down clue clicked

	    clueIndex = event.target.selectedIndex;
    	clueNumber =  _cwo.clues["down"][clueIndex].no;
	    _cwo.direction = 'down';
    }
	
	
	for ( rowIndex  = 0; rowIndex < _cwo.nSize; rowIndex++ )
	{
 		for ( cIndex = 0; cIndex < _cwo.nSize; cIndex++ )
		{
			var id = "#" + cellID( rowIndex,  cIndex );
 			if ( $(id).data('number') == clueNumber )
 			{
                $(id).click();
 				break;
 			}
		}
	} 	

};

function makeElement( nodeName, nodeClass, nodeID, content )
{ 
	id = ( nodeID    == "" ? nodeID : " id='" + nodeID +"' " );
	cl = ( nodeClass == "" ? nodeClass : " class='" + nodeClass +"'");
	return "<" + nodeName + id + cl  + ">" + content + "</" + nodeName + ">";
};
	

function paintCell( id, selector ) // display either the answer or the player's current value in the cell 
{
	numID = "#N" + id.substring(1);
	value = $(id).data(selector);
	if ( _cwo.BLACKCELL  ==  $(id).data('answer' ) ) return;
 	if ( ( selector == 'player') && ( value == ' ' ) && (  0 <  $(id).data("number" ) ) )
	{
		$(numID).text( $(id).data("number") )
	}
 	$(id).text( value );			
};

function moveToCell( id )  // put the cursor in the given cell 
{
    // Remove the class from the previously selected cell and
    //  and it to the new one
 	$(_cwo.currCell).removeClass('cwCurrentCell');
 	$(id).addClass('cwCurrentCell').removeClass('cwWrong').removeClass('cwCorrect');

    // Remove the highlight from the previous word selection
    $(".cwCurrentWord").removeClass('cwCurrentWord').removeClass('cwWrong').removeClass('cwCorrect');

 	_cwo.currRow = $(id).data('row');
 	_cwo.currCol = $(id).data('col');
 	_cwo.currCell = "#"  + cellID( _cwo.currRow, _cwo.currCol );
 	$(_cwo.currCell).focus();


    
    // Highlight the currently selected word spaces
    if (_cwo.direction == "across") {
        
        // Color left of cursor
	    for ( cIndex = _cwo.currCol - 1; cIndex >= 0; cIndex--)
        {
 			if (answer( _cwo.currRow, cIndex) == _cwo.BLACKCELL) {
                break;
            }

 	        currCellId = "#"  + cellID(_cwo.currRow, cIndex);
            $(currCellId).addClass('cwCurrentWord').removeClass('cwWrong').removeClass('cwCorrect');
        }

        // Color right of cursor
        for (cIndex = _cwo.currCol + 1; cIndex < _cwo.nSize; cIndex++) 
        {
 			if (answer( _cwo.currRow, cIndex) == _cwo.BLACKCELL) {
                break;
            }

 	        currCellId = "#"  + cellID(_cwo.currRow, cIndex);
            $(currCellId).addClass('cwCurrentWord').removeClass('cwWrong').removeClass('cwCorrect');
        }

    } else {

        // Color above the cursor
        for (rIndex = _cwo.currRow - 1; rIndex >= 0; rIndex--) 
        {
 			if (answer(rIndex, _cwo.currCol) == _cwo.BLACKCELL) {
                break;
            }
 	        currCellId = "#"  + cellID(rIndex, _cwo.currCol);
            $(currCellId).addClass('cwCurrentWord').removeClass('cwWrong').removeClass('cwCorrect');
        }
        
        // Color below the cursor
        for (rIndex = _cwo.currRow + 1; rIndex < _cwo.nSize; rIndex++) 
        {
 			if (answer(rIndex, _cwo.currCol) == _cwo.BLACKCELL) {
                break;
            }

 	        currCellId = "#"  + cellID(rIndex, _cwo.currCol);
            $(currCellId).addClass('cwCurrentWord').removeClass('cwWrong').removeClass('cwCorrect');
        }
    }
}; 	


function alignClue ( direction, clues )
{
	selectorID =  "#" + direction + "selector";
	clueNo = 1;
	
	if ( direction == "A" ) 
    {
	    for ( cIndex = _cwo.currCol; cIndex > -1; cIndex--)
 		{   
 			if ( ( cIndex == 0 ) || ( cIndex > 0 && ( answer( _cwo.currRow, cIndex-1 ) == _cwo.BLACKCELL )) )
 			{
				clueNo = $("#"  + cellID( _cwo.currRow, cIndex )).data("number");
				break;
			}			
		}
	}
	else 
	{
	    for ( rIndex = _cwo.currRow; rIndex > -1; rIndex--)
 		{   
 			if ( ( rIndex == 0 ) || ( rIndex > 0 && ( answer( rIndex-1, _cwo.currCol ) == _cwo.BLACKCELL )) )
 			{
				clueNo = $("#"  + cellID( rIndex, _cwo.currCol )).data("number")
				break;
			}			
		}
	}
	
	
	targetIndex = -1;
	for ( index = 0; index < clues.length; index++ )
		if ( clues[index].no == clueNo )
    		targetIndex  = index;
    
	preIndex =  ( targetIndex < 5 ) ? 1 : ( targetIndex - 5 );	
	
	$(selectorID)[0].selectedIndex = preIndex;
	$(selectorID)[0].selectedIndex = targetIndex;
			
	
};


function goAcross( bLeft )
{
	var currVal = _cwo.currCol;

    if (_cwo.direction == 'down') {
        // Switching directions.  Redraw word cursor in the new position and DONT move.
        _cwo.direction = 'across';
        return;
    }
	_cwo.direction = 'across'
 	while( 0 < 1 )
	{	
		if ( bLeft ) { _cwo.currCol--  } else _cwo.currCol++;
		if ( ( _cwo.currCol < 0  ) || ( _cwo.currCol == _cwo.puzzle.row.length  ) ) { _cwo.currCol = currVal; return; }
	    if ( answer( _cwo.currRow, _cwo.currCol ) != _cwo.BLACKCELL ) return;
	}
};

function goDown( bUp )
{
	var currVal = _cwo.currRow;

    if (_cwo.direction == 'across') {
        // Switching directions.  Redraw word cursor in the new position and DONT move.
        _cwo.direction = 'down';
        return;
    }

	_cwo.direction = 'down'
 	while( 0 < 1 )
	{	
		if ( bUp ) { _cwo.currRow--  } else _cwo.currRow++;
		if ( ( _cwo.currRow < 0  ) || ( _cwo.currRow == _cwo.puzzle.row.length   ) ) { _cwo.currRow = currVal; return; }
	    if ( answer( _cwo.currRow, _cwo.currCol ) != _cwo.BLACKCELL ) return;
	}
};


function codeToChar( code )
{
	  _CAPS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	 if ( code == 32 ) return " ";
	 if ( ( code < 65 ) || ( code > 122 ) ) return _cwo.NA;
	 if ( ( code > 90 ) && ( code < 97  ) ) return _cwo.NA;
	 index =  ( code > 96 ) ? code - 32 : code;
	 index = index - 65;
	 return _CAPS.substring( index, index+1);
};


 
function setUpClues( outerDiv, clueArray, idTic)
{
	_clueList  = ""
	selectID =  idTic + "selector";   
	for ( index = 0; index < clueArray.length; index++ )
	{		
		var itemID = idTic + clueArray[index].no;
		var itemText = clueArray[index].no  + ". " + clueArray[index].text
		var item = makeElement( "option", "liClue", itemID, itemText );
	    _clueList = _clueList + item;
	}
	
	$(outerDiv).html(  
		"<select size='" + clueArray.length + "' class='clueDiv' id='" + selectID + "'>" + _clueList + "</select>"
		);

};
 
 
function paintPuzzle( key )
{
	for ( rowIndex  = 0; rowIndex < _cwo.nSize; rowIndex++ )
	{
 		for ( cIndex = 0; cIndex < _cwo.nSize; cIndex++ )
		{
			var id = "#" + cellID( rowIndex,  cIndex );
			paintCell ( id, key );
		}	 
	}
	 
};	 

function giveHint() {
    
    if (_cwo.currCol < 0 || _cwo.currCol >= _cwo.nSize ||
        _cwo.currRow < 0 || _cwo.currRow >= _cwo.nSize)
    {
        return;
    }

    insertSymbol($(_cwo.currCell).data('answer'));
}

function clearPuzzle() {
	for ( rowIndex  = 0; rowIndex < _cwo.nSize; rowIndex++ )
	{
 		for ( cIndex = 0; cIndex < _cwo.nSize; cIndex++ )
		{
			var id = "#" + cellID( rowIndex,  cIndex );
            $(id).data('player', '');
            $(id).removeClass('cwCorrect').removeClass('cwWrong');
            paintCell(id, 'player');
		}	 
	}
}

function checkPuzzle() {
	for ( rowIndex  = 0; rowIndex < _cwo.nSize; rowIndex++ )
	{
 		for ( cIndex = 0; cIndex < _cwo.nSize; cIndex++ )
		{
			var id = "#" + cellID( rowIndex,  cIndex );
            var a = $(id).data('answer');
            if (a == _cwo.BLACKCELL) continue;

            if ($(id).data('player') == a) {
                $(id).removeClass('cwWrong').addClass('cwCorrect');
            } else {
                $(id).removeClass('cwCorrect').addClass('cwWrong');
            }
		}	 
	}
}


