// main.js include some basic functions like: 
// Run() to proceed the input code
// Clear() to make input and output empty
// addError() to generate error message
// is**() to check the type of a given string

// output consist of two parts, computation result and error message
var GlobalResult = "";
var GlobalError = "";

 
function Clear() {
	document.getElementById("output").value = "Result will appear here";
	document.getElementById("input").value = "Write some code here";
	GlobalResult = "";	
}

function Run() {
	var content = document.getElementById("input").value;
	GlobalError = "";
	GlobalResult = "";
	var c = read(content);
	//console.log(c);
	var myTree = new Tree();
	myTree.eat(c);	
	console.log(myTree);
	//console.log(myTree.scope);
	console.log(myTree.funcTable.show());
	document.getElementById("output").value = GlobalError;
	myTree.go();
	//console.log(myTree.stack);
	
	document.getElementById("output").value = GlobalError + GlobalResult;	
}

function addError(line, posi, message) {
	GlobalError += "line " + line + "." + (posi+1) + ": " + message + " \n";
}

function isString(s) {
	return s.charAt(0)==='"' && s.charAt(s.length-1)==='"' && s.length>=2;
}

// however, a number like 5.4.3 may pass this test, but will be dealt with in runtime
function isNum(s) {
	if(s.charAt(0)==="-") {
		s = s.slice(1);
	}
	var patt = /[^0-9.]+/g;
    return !patt.test(s) && s.length>0;
}

function isComparison(s) {
	var t = s.toUpperCase();
	return (t==">" ||
			t=="<" ||
			t=="=" ||
			t==">=" ||
			t=="<=" ||
			t=="<>" ||
			false);
}

function isOperator(s) {
	var t = s.toUpperCase();
	return (t=="+" ||
			t=="-" ||
			t=="*" ||
			t=="/" ||
			t=="(" ||
			t==")" ||
			isComparison(s) ||
			false);
}

function isKeyword(s) {
	var t = s.toUpperCase();
	return (t=="NUMBER" ||
			t=="TEXT" ||
			t=="LET" ||
			t=="CLEAR" ||
			t=="PRINT" ||
			t=="IF" ||
			t=="THEN" ||
			t=="ELSE" ||
			t=="ENDIF" ||
			t=="AND" ||    //-- not keywords, because they
			t=="OR" ||    //-- don't end expressions
			t=="INPUT" ||
			t=="NOECHO" ||
			t=="WHEN" ||
			t=="COMPLAIN" ||
			t=="PLOT" ||
			t=="FOR" ||
			t=="TO" ||
			t=="STEP" ||
			t=="ENDFOR" ||
			t=="REPEAT" ||
			t=="ENDREPEAT" ||
			t=="BREAK" ||
			t=="FUNCTION" ||
			t=="ENDFUNCTION" ||
			t=="RETURN" ||
			t=="PAUSE" ||
			t=="DRAW" ||
			t=="AT" ||
			t=="COLOR" ||
			t=="BORDER" ||
			t=="GRAPHOPTION" ||
			t=="GOPT" ||
			t=="POINTSHAPE" ||
			t=="POINTSIZE" ||
			t=="POINTCOLOR" ||
			t=="LINETYPE" ||
			t=="LINEWIDTH" ||
			t=="LINECOLOR" ||
			t=="SHOWAXES" ||
			t=="AXISCOLOR" ||
			t=="SHOWTICKS" ||
			t=="TOPTEXT" ||
			t=="BOTTOMTEXT" ||
			t=="NEWSERIES" ||
			t=="BACKGROUNDCOLOR" ||
			false);		
}