
// eat is to build ParseTree. Depends on the command, it builds in specific ways.
Tree.prototype.eat = function(c) {
	for(var line in c) {
		if(c[line].length<1) {
			continue;
		}
		var command = c[line][0][0];
		var line_num = c[line][0][1];
		var posi_num = c[line][0][2];
		
		switch(command.toUpperCase()) {
			case "PRINT":
				this.eatPrint(c[line]);
				break;
			case "COMPLAIN":
				this.eatComplain(c[line]);
				break;
			case "NUMBER":
				this.eatNumber(c[line]);
				break;
			case "TEXT":
				this.eatText(c[line]);
				break;
			case "LET":
				this.eatLet(c[line]);
				break;
			case "INPUT":
				this.eatInput(c[line]);
				break;
			case "IF":
				this.eatIf(c[line]);
				break;
			case "ELSE":
				this.eatElse(c[line]);
				break;
			case "ENDIF":
				this.eatEndIf(c[line]);
				break;
			case "REPEAT":
				this.eatRepeat(c[line]);
				break;
			case "BREAK":
				this.eatBreak(c[line]);
				break;
			case "ENDREPEAT":
				this.eatEndRepeat(c[line]);
				break;
			case "FOR":
				this.eatFor(c[line]);
				break;
			case "ENDFOR":
				this.eatEndFor(c[line]);
				break;
			case "FUNCTION":
				this.eatFunction(c[line]);
				break;
			case "RETURN":
				this.eatReturn(c[line]);
				break;
			case "ENDFUNCTION":
				this.eatEndFunction(c[line]);
				break;
			// new command DO, which is to run a subroutine without return any value
			case "DO":
				this.eatDo(c[line]);
				break;
			case "REM":
			case "REMARK":
			case "COM":
			case "COMMENT":
				break;
			default:
				addError( line_num, posi_num, "looking for command but instead find " + command);
		}
	}
	
	if(this.rootType.length>0) {
		var remain = this.root.pop();
		var remainCommand = this.rootType.pop().toUpperCase();
		if(remain.value==="else") {
			remain = remain.father;
			addError( remain.line, remain.posi, "the command " + remainCommand + " is missing an END" + remainCommand);
		}
		else {
			addError( remain.line, remain.posi, "the command " + remainCommand + " is missing an END" + remainCommand);
		}
	}
}

Tree.prototype.eatPrint = function(lineArr) {
	this.addSon(["print", lineArr[0][1], lineArr[0][2]]);
	this.mark();
	var dot = 1;
	while(dot<lineArr.length) {
		dot = this.eatExpression(lineArr, dot)[0];		
		this.gotoRoot();
	}
	this.unmark();
	this.gotoRoot();
}

Tree.prototype.eatComplain = function(lineArr) {
	this.addSon(["complain", lineArr[0][1], lineArr[0][2]]);
	this.mark();
	if(lineArr.length<2) {
		addError(lineArr[0][1], lineArr[0][2], "missing content after COMPLAIN");
		return;
	}
	var dot = this.eatExpression(lineArr, 1);
	if(dot[1]!=="S") {
		addError(lineArr[0][1], lineArr[0][2], "the content after COMPLAIN should be text");
		this.gotoRoot();
		this.discardLastSon();
		return;
	}
	if(dot[0]<lineArr.length) {
		addError(lineArr[0][1], lineArr[0][2], "more than one value received after COMPLAIN");
	}
	this.unmark();
	this.gotoRoot();
}

Tree.prototype.eatNumber = function(lineArr) {	
	if(lineArr.length<2) {
		addError(lineArr[0][1], lineArr[0][2], "the command NUMBER is not complete");
		return;
	}
	else {
		var name = lineArr[1][0];
		if(this.checkName(lineArr[1])) {
			this.scope.addVar(name, "num");
			this.addSon(["number", lineArr[0][1], lineArr[0][2]]);
			this.addSon(lineArr[1]);
		}
		else {
			return;
		}
	}
	
	if(lineArr.length>2) {
		if(lineArr[2][0]!=='=') {
			addError(lineArr[2][1], lineArr[2][2], "invalid format for command NUMBER, variable name should be followed by =");
		}
		else if(lineArr.length<4) {
			addError(lineArr[2][1], lineArr[2][2], "number missing after =");
		}
		else {	
			this.gotoFather();
			this.mark();
			var dot = this.eatExpression(lineArr, 3);
			if(dot[1]!=="N") {
				addError(lineArr[2][1], lineArr[3][2], "type confliction for command NUMBER, the value after = should be a number");
				this.gotoRoot();
				this.discardLastSon();
			}
			else if(dot[0]<lineArr.length) {
				addError(lineArr[2][1], lineArr[dot[0]][2], "more than one value received after =");
			}
			this.unmark();
		}
	}
	this.gotoRoot();
}

Tree.prototype.eatText = function(lineArr) {	
	if(lineArr.length<2) {
		addError(lineArr[0][1], lineArr[0][2], "the command TEXT is not complete");
		return;
	}
	else {
		var name = lineArr[1][0];
		if(this.checkName(lineArr[1])) {
			this.scope.addVar(name, "string");
			this.addSon(["text", lineArr[0][1], lineArr[0][2]]);
			this.addSon(lineArr[1]);
		}
		else {
			return;
		}
	}
	
	if(lineArr.length>2) {
		if(lineArr[2][0]!=='=') {
			addError(lineArr[2][1], lineArr[2][2], "invalid format for command TEXT, variable name should be followed by =");
		}
		else if(lineArr.length<4) {
			addError(lineArr[2][1], lineArr[2][2], "text missing after =");
		}
		else {	
			this.gotoFather();
			this.mark();
			var dot = this.eatExpression(lineArr, 3);
			if(dot[1]!=="S") {
				addError(lineArr[2][1], lineArr[3][2], "type confliction for command TEXT, the value after = should be a text");
				this.gotoRoot();
				this.discardLastSon();
			}
			else if(dot[0]<lineArr.length) {
				addError(lineArr[2][1], lineArr[dot[0]][2], "more than one value received after =");
			}
			this.unmark();
		}
	}
	this.gotoRoot();
}

Tree.prototype.eatLet = function(lineArr) {
	if(lineArr.length<4) {
		addError(lineArr[0][1], lineArr[0][2], "the command LET is not complete");
	}
	else {
		var name = lineArr[1][0];
		if(!this.scope.existVar(name)) {
			addError(lineArr[1][1], lineArr[1][2], "the variable " + name + " is not defined yet");
		}
		else if(lineArr[2][0]!=='=') {
			addError(lineArr[2][1], lineArr[2][2], "invalid format for command LET, variable name should be followed by =");
		}
		else {
			var type = this.scope.getVar(name);
			this.addSon(["let", lineArr[0][1], lineArr[0][2]]);
			this.addSon(lineArr[1]);
			this.gotoFather();
			this.mark();
			var dot = this.eatExpression(lineArr, 3);
			if(type==="num" && dot[1]!=="N") {
				addError(lineArr[2][1], lineArr[3][2], "type confliction for command LET, the value after = should be a number");
				this.gotoRoot();
				this.discardLastSon();
			}
			else if(type==="string" && dot[1]!=="S") {
				addError(lineArr[2][1], lineArr[3][2], "type confliction for command LET, the value after = should be a text");
				this.gotoRoot();
				this.discardLastSon();
			}
			else if(dot[0]<lineArr.length) {
				addError(lineArr[dot[0]][1], lineArr[dot[0]][2], "more than one value received after =");
			}
			this.unmark();
		}
	}
	this.gotoRoot();
}

Tree.prototype.eatInput = function(lineArr) {
	var name = lineArr[lineArr.length-1][0];
	if(!this.scope.existVar(name)) {
		addError(lineArr[lineArr.length-1][1], lineArr[lineArr.length-1][2], "invalid name of variable " + name + ", maybe need to declare it before use");
		return;
	}
	var textArr = lineArr.slice(1,lineArr.length-1);
	if(textArr.length<1) {
		addError(lineArr[0][1], lineArr[0][2], "missing text to display");
		return;
	}
	this.addSon(["input", lineArr[0][1], lineArr[0][2]]);
	this.mark();
	var dot = this.eatExpression(textArr, 0);
	// if textArr does not return a text, "input" will have only one son
	if(dot[1]!=="S") {
		addError(lineArr[1][1], lineArr[1][2], "the content to display should be text");
		return;
	}
	if(dot[0]<textArr.length) {
		addError(lineArr[dot[0]][1], lineArr[dot[0]][2], "more than one value received after INPUT");
	}
	this.gotoRoot();
	this.addSon([name, lineArr[lineArr.length-1][1], lineArr[lineArr.length-1][2]]);
	this.gotoRoot();
	this.addSon([this.checkType(name), lineArr[lineArr.length-1][1], lineArr[lineArr.length-1][2]]);
	this.unmark();
	this.gotoRoot();
}

Tree.prototype.eatIf = function(lineArr) {	
	if(lineArr[lineArr.length-1][0].toUpperCase()!=="THEN") {
		addError(lineArr[lineArr.length-1][1], lineArr[lineArr.length-1][2], "a complete command IF must be ended with THEN");
	}
	else {
		lineArr = lineArr.slice(0, lineArr.length-1);
	}
	this.addSon(["if", lineArr[0][1], lineArr[0][2]]);
	this.rootType.push("if");
	this.mark();
	var dot = this.eatExpression(lineArr, 1);
	if(dot[1]!=='B') {
		addError(lineArr[0][1], lineArr[0][2], "the condition after IF must be either true or false");
		this.gotoRoot();
		this.discardLastSon();
		this.addSon(["", lineArr[0][1], -1]);
	}
	else if(dot[0]<lineArr.length-1) {
		addError(lineArr[dot[0]][1], lineArr[dot[0]][2], "more than one value after IF");
	}
	this.gotoRoot();
	this.unmark();
	this.addSon(["then", lineArr[0][1], lineArr[0][2]]);	
	this.mark();
}

Tree.prototype.eatElse = function(lineArr) {
	if(lineArr.length>1) {
		addError(lineArr[0][1], lineArr[0][2], "invalid input after ELSE");
	}
	if(this.rootType.length>0 && this.rootType[this.rootType.length-1]==="if") {
		this.gotoRoot();
		this.gotoFather();
		if(this.getCurrent().sons.length > 2) {
			addError(lineArr[0][1], lineArr[0][2], "this IF already has an ELSE");
			this.gotoRoot();
		}
		else {
			this.unmark();
			this.addSon(["else", lineArr[0][1], lineArr[0][2]]);			
			this.mark();
		}
	}
	else if(this.rootType.length<1) {
		addError(lineArr[0][1], lineArr[0][2], "can not pair ELSE to an existing IF");
	}
	else if(this.rootType[this.rootType.length-1]!=="if") {
		addError(lineArr[0][1], lineArr[0][2], "invalid ELSE, a " + this.rootType[this.rootType.length-1].toUpperCase() + " need to be ended first");
	}
}

Tree.prototype.eatEndIf = function(lineArr) {
	if(lineArr.length>1) {
		addError(lineArr[0][1], lineArr[0][2], "invalid input after ENDIF");
	}
	if(this.rootType.length>0 && this.rootType[this.rootType.length-1]==="if") {
		this.rootType.pop();
		this.unmark();
		this.gotoRoot();
	}
	else if(this.rootType.length<1) {
		addError(lineArr[0][1], lineArr[0][2], "can not pair ENDIF to an existing IF");
	}
	else if(this.rootType[this.rootType.length-1]!=="if") {
		addError(lineArr[0][1], lineArr[0][2], "invalid ENDIF, a " + this.rootType[this.rootType.length-1].toUpperCase() + " need to be ended first");
	}
}

Tree.prototype.eatRepeat = function(lineArr) {	
	if(lineArr.length>1) {
		addError(lineArr[0][1], lineArr[0][2], "invalid input after REPEAT");
	}
	this.addSon(["repeat", lineArr[0][1], lineArr[0][2]]);
	this.repeatNode.push(this.getCurrent());
	this.rootType.push("repeat");
	this.mark();
}

Tree.prototype.eatBreak = function(lineArr) {
	if(lineArr.length>1) {
		addError(lineArr[0][1], lineArr[0][2], "invalid input after BREAK");
	}
	this.addSon(["break", lineArr[0][1], lineArr[0][2]]);
	this.gotoRoot();
}

Tree.prototype.eatEndRepeat = function(lineArr) {
	if(lineArr.length>1) {
		addError(lineArr[0][1], lineArr[0][2], "invalid input after ENDREPEAT");
	}
	if(this.rootType.length>0 && this.rootType[this.rootType.length-1]==="repeat") {
		this.addSon(["continue", lineArr[0][1], -1]);
		this.addSon([this.repeatNode.pop(), lineArr[0][1], -1]);
		this.rootType.pop();
		this.unmark();
		this.gotoRoot();
	}
	else if(this.rootType.length<1) {
		addError(lineArr[0][1], lineArr[0][2], "can not pair ENDREPEAT to an existing REPEAT");
	}
	else if(this.rootType[this.rootType.length-1]!=="repeat") {
		addError(lineArr[0][1], lineArr[0][2], "invalid ENDREPEAT, a " + this.rootType[this.rootType.length-1].toUpperCase() + " need to be ended first");
	}
}

Tree.prototype.eatFor = function(lineArr) {
	// find "TO" and locate
	var i = 0;
	while(i<lineArr.length) {
		if(lineArr[i][0].toUpperCase()==="TO") {
			break;
		}
		i += 1;
	}
	// no "TO" is found
	if(i===lineArr.length) {
		addError(lineArr[0][1], lineArr[0][2], "missing TO in command FOR");
		return;
	}
	// "TO" is found, retrieve the initialization
	var defArr = lineArr.slice(1,i);
	
	// find "STEP" and locate
	var j = i;
	var hasStep = true;
	var destArr = [];
	var stepArr = []
	while(j<lineArr.length) {
		if(lineArr[j][0].toUpperCase()==="STEP") {
			break;
		}
		j += 1;
	}
	// no "STEP" is found
	if(j===lineArr.length) {
		hasStep = false;
		destArr = lineArr.slice(i+1, lineArr.length);
	}
	// "STEP" is found
	else {
		destArr = lineArr.slice(i+1, j);
		stepArr = lineArr.slice(j+1, lineArr.length);
	}
	this.addSon(["for", lineArr[0][1], lineArr[0][2]]);
	this.rootType.push("for");
	this.mark();
	if(defArr.length<3) {
		addError(lineArr[0][1], lineArr[0][2], "command For initialization incomplete");
		this.rootType.pop();
		this.unmark();
		this.gotoRoot();
		return;
	}
	var name = defArr[0][0];
	if(this.checkName(defArr[0])) {
		this.scope.addVar(name, "num");
		this.addSon(defArr[0]);
		this.gotoRoot();
	}
	else {
		this.rootType.pop();
		this.unmark();
		this.gotoRoot();
		return;
	}
	if(defArr[1][0]!=="=") {
		addError(defArr[1][1], defArr[1][2], "invalid format, variable name should be followed by =");
		this.rootType.pop();
		this.unmark();
		this.gotoRoot();
		return;
	}
	var dot1 = this.eatExpression(defArr, 2);
	if(dot1[1]!=="N") {
		addError(defArr[2][1], defArr[2][2], "type confliction in command FOR, the value after = should be a number");
		this.rootType.pop();
		this.unmark();
		this.gotoRoot();
		return;
	}
	else if(dot1[0]<defArr.length) {
		addError(defArr[dot1[0]][1], defArr[dot1[0]][2], "more than one value received after =");
	}
	this.gotoRoot();
	
	var dot2 = this.eatExpression(destArr, 0);
	if(dot2[1]!=="N") {
		addError(destArr[0][1], destArr[0][2], "type confliction in command FOR, the value after TO should be a number");
		this.rootType.pop();
		this.unmark();
		this.gotoRoot();
		return;
	}
	else if(dot2[0]<destArr.length) {
		addError(destArr[dot2[0]][1], destArr[dot2[0]][2], "more than one value received after TO");
	}
	this.gotoRoot();
	
	if(!hasStep) {
		this.addSon(["1", lineArr[0][1], -1]);
	}
	else {
		var dot3 = this.eatExpression(stepArr, 0);
		if(dot3[1]!=="N") {
			addError(stepArr[0][1], stepArr[0][2], "type confliction in command FOR, the value after STEP should be a number");
			this.rootType.pop();
			this.unmark();
			this.gotoRoot();
			return;
		}
		else if(dot3[0]<destArr.length) {
			addError(stepArr[dot3[0]][1], stepArr[dot3[0]][2], "more than one value received after STEP");
		}
	}	
	this.gotoRoot();
	// add "forloop" as "start"
	this.addSon(["forloop", lineArr[0][1], lineArr[0][2]]);
	this.unmark();
	this.mark();
}

Tree.prototype.eatEndFor = function(lineArr) {
	if(lineArr.length>1) {
		addError(lineArr[0][1], lineArr[0][2], "invalid input after ENDFOR");
	}
	if(this.rootType.length>0 && this.rootType[this.rootType.length-1]==="for") {
		this.rootType.pop();
		this.unmark();
		this.gotoRoot();
	}
	else if(this.rootType.length<1) {
		addError(lineArr[0][1], lineArr[0][2], "can not pair ENDFOR to an existing FOR");
	}
	else if(this.rootType[this.rootType.length-1]!=="for") {
		addError(lineArr[0][1], lineArr[0][2], "invalid ENDFOR, a " + this.rootType[this.rootType.length-1].toUpperCase() + " need to be ended first");
	}
}

Tree.prototype.eatFunction = function(lineArr) {
	
	this.addSon(["function", lineArr[0][1], lineArr[0][2]]);
	this.addSon(["startFunc", lineArr[0][1], lineArr[0][2]]);
	this.mark();
	this.rootType.push("function");
	this.scope.addLayer();
		
	if(lineArr.length<2) {
		addError(lineArr[0][1], lineArr[0][2], "the command FUNCTION must be followed by a name for the function");
		return;
	}
	else {
		var name = lineArr[1][0];	
		if(!this.checkName(lineArr[1])) {
			return;
		}
		else {
			this.funcTable.addFunc(name, this.getCurrent());
		}
		
		if(lineArr.length<4 || lineArr[2][0]!=="(" || lineArr[lineArr.length-1][0]!==")") {
			addError(lineArr[0][1], lineArr[0][2], "invalid format for command FUNCTION, parenthesis containing arguments expected");
			this.addSon(["defFunc", lineArr[0][1], lineArr[0][2]]);
			this.gotoRoot();
		}		
		else {
			this.addSon(["defFunc", lineArr[0][1], lineArr[0][2]]);
			this.mark();
			var arguArr = lineArr.slice(3, lineArr.length-1);
			var i = 0;
			while(i<arguArr.length) {
				if(i<arguArr.length-1) {
					var title = arguArr[i][0].toUpperCase();
					var argument = arguArr[i+1][0];
					if(title==="NUMBER") {
						if(this.checkName(arguArr[i+1])) {
							this.scope.addVar(argument, "num");
							this.addSon(["number", arguArr[i][1], arguArr[i][2]]);
							this.addSon(arguArr[i+1]);
						}
					}
					else if(title==="TEXT") {
						if(this.checkName(arguArr[i+1])) {
							this.scope.addVar(argument, "string");
							this.addSon(["text", arguArr[i][1], arguArr[i][2]]);
							this.addSon(arguArr[i+1]);
						}
					}
					else {
						addError(arguArr[i][1], arguArr[i][2], "the type of argument must be either NUMBER or TEXT");
						break;
					}
					i += 2;
					this.gotoRoot();
					if(i<arguArr.length) {
						if(arguArr[i][0]===",") {							
							if(i===arguArr.length-1) {
								addError(arguArr[i][1], arguArr[i][2], "missing content after ,");
							}
							i += 1;
						}
						else {
							addError(arguArr[i][1], arguArr[i][2], "arguments must be seperated by ,");
						}
					}
				}
				else {
					addError(arguArr[i][1], arguArr[i][2], "the argument declaration is not complete");
					break;
				}
			}
			this.unmark();
			this.gotoRoot();
		}
	}
}

Tree.prototype.eatReturn = function(lineArr) {
	if(this.funcTable.curr.length<1) {
		addError(lineArr[0][1], lineArr[0][2], "can not pair RETURN to an existing FUNCTION");
		return;
	}
	if(lineArr.length<2) {
		// no return value
		this.addSon(["return", lineArr[0][1], lineArr[0][2]]);
		if(!this.funcTable.setType("otherF")) {
			addError(lineArr[0][1], lineArr[0][2], "conflicting type of value in RETURN");
		}
	}
	else {
		this.addSon(["return", lineArr[0][1], lineArr[0][2]]);
		var dot = this.eatExpression(lineArr, 1);
		if(dot[0]<lineArr.length) {
			addError(lineArr[0][1], lineArr[0][2], "more than one value after RETURN");
		}
		
		if(dot[1]==="S") {
			if(!this.funcTable.setType("stringF")) {
				addError(lineArr[0][1], lineArr[1][2], "conflicting RETURN type, should be a number");
			}
		}
		else if(dot[1]==="N") {
			if(!this.funcTable.setType("numF")) {
				addError(lineArr[0][1], lineArr[1][2], "conflicting RETURN type, should be a text");
			}
		}
		// dot[1]==="" occurs during recursion, when a function returns itself and the type can not be determined yet
		else if(dot[1]==="") {
			if(!this.funcTable.setType("otherF")) {
				addError(lineArr[0][1], lineArr[1][2], "conflicting RETURN type");
			}
		}
		else {
			addError(lineArr[0][1], lineArr[1][2], "invalid type of value in RETURN");
		}
	}
	this.gotoRoot();
}

Tree.prototype.eatEndFunction = function(lineArr) {
	if(lineArr.length>1) {
		addError(lineArr[0][1], lineArr[0][2], "invalid input after ENDFUNCTION");
	}
	if(this.rootType.length>0 && this.rootType[this.rootType.length-1]==="function") {
		this.rootType.pop();
		this.unmark();		
		this.scope.removeLayer();
		this.funcTable.passFunc();
		this.gotoRoot();
	}
	else if(this.rootType.length<1) {
		addError(lineArr[0][1], lineArr[0][2], "can not pair ENDFUNCTION to an existing FUNCTION");
	}
	else if(this.rootType[this.rootType.length-1]!=="function") {
		addError(lineArr[0][1], lineArr[0][2], "invalid ENDFUNCTION, a " + this.rootType[this.rootType.length-1].toUpperCase() + " need to be ended first");
	}
}

// Imagine, in the command "print x + 1", whether x is text or number, the structure of parsetree is different.
// Thus type matters.
// A function checkType() is used to determine type for precessor and current node,
// And a function compatible() is used to decide whether to build the new node sequently, like in 1 + 2
// Or either to start a new branch, like in "print 5 6", or to report an error, like in 5 * "text"
Tree.prototype.eatExpression = function(lineArr, start) {
	// type of precessor node
	var pre = "start";
	// type of current node
	var present = "";
	// type of expression, "S" for string, "N" for num, "B" for boolean
	var expType = "";
	// record unpaired ( node
	var bracketNode = [];
	var line, posi, value;
	for(var i=start; i<lineArr.length; i++) {
		value = lineArr[i][0];
		line = lineArr[i][1];
		posi = lineArr[i][2];
		present = this.checkType(value);
		// if the format is valid
		if(compatible(pre, present)) {
			if(present===",") {
				this.addSon(lineArr[i]);
				i += 1;
				break;
			}
			else if(present==="string") {
				this.addSon(lineArr[i]);
				if(expType === "") {
					expType = "S";
				}
			}
			else if(present==="num") {
				this.addSon(lineArr[i]);
				if(expType === "") {
					expType = "N";
				}
			}
			else if(present==="sign") {
				if(pre==="start" || pre==="(" || pre==="and" || pre==="or" || pre==="compare") {
					this.addSon(["0", line, -1]);
					this.insertFather(lineArr[i]);
				}
				if(pre==="num" || pre===")") {
					var fatherValue = this.getFather().value;
					while(fatherValue==="+" || fatherValue==="-" || fatherValue==="*" || fatherValue==="/") {
						this.gotoFather();
						fatherValue = this.getFather().value;
					}
					this.insertFather(lineArr[i]);
				}
				if(expType === "") {
					expType = "N";
				}
			}
			else if(present==="operation") {
				var fatherValue = this.getFather().value;
				while(fatherValue==="*" || fatherValue==="/") {
					this.gotoFather();
					fatherValue = this.getFather().value;
				}
				this.insertFather(lineArr[i]);
				if(expType === "") {
					expType = "N";
				}
			}
			else if(present=="(") {								
				this.addSon(lineArr[i]);
				bracketNode.push(this.getCurrent());
			}
			else if(present===")") {
				if(bracketNode.length>0) {
					this.gotoCertainNode(bracketNode.pop());
				}
				else {
					addError(line, posi, "parenthesis do not match, maybe a ( is missing");
					continue;
				}
			}
			else if(present==="compare") {
				var fatherValue = this.getFather().value;
				var fatherType = this.checkType(fatherValue);
				while(fatherType==="operation" || fatherType==="sign" || fatherType==="compare") {
					this.gotoFather();
					fatherValue = this.getFather().value;
					fatherType = this.checkType(fatherValue);
				}
				this.insertFather(lineArr[i]);
				expType = "B";
			}
			else if(present==="and" || present==="or") {
				var fatherValue = this.getFather().value;
				var fatherType = this.checkType(fatherValue);
				while(fatherType==="operation" || fatherType==="sign" || fatherType==="compare" || fatherType==="and" || fatherType==="or") {
					this.gotoFather();
					fatherValue = this.getFather().value;
					fatherType = this.checkType(fatherValue);
				}
				this.insertFather([present, line, posi]);
				expType = "B";
			}
			else if(present==="numF") {
				present="num";
				i = this.eatCall(lineArr, i);
				if(expType === "") {
					expType = "N";
				}
			}
			else if(present==="stringF") {
				present="string";
				i = this.eatCall(lineArr, i);
				if(expType === "") {
					expType = "S";
				}
			}
			else {
				console.log("unexpected situation in eatExpression, compatible");
			}
			
			pre=present;
		}
		// if the format is not valid
		else {
			if(present==="other") {
				if(isKeyword(value)) {
					addError(line, posi, "invalid position for keyword " + value);
					continue;
				}
				else {
					addError(line, posi, "undefined variable or function " + value);
					continue;
				}
			}
			else if(present==="otherF") {
				// a function is called before finish construction, AKA recursive call, parse the call as num, but the type of expression remain unclear
				if(this.funcTable.existCurr(value)) {					
					i = this.eatCall(lineArr, i);
					pre="num";
				}
				else {
					addError(line, posi, "the function " + value + " does not have a valid return type");
					continue;
				}
			}
			else if(pre==="start") {
				if(present==="operation") {
					addError(line, posi, "number missing before " + value);
					continue;
				}
				else if(present==="compare") {
					addError(line, posi, "content missing before " + value);
					continue;
				}
				else if(present==="and" || present==="or") {
					addError(line, posi, "content missing before " + value.toUpperCase());
					continue;
				}
				else if(present===")") {
					addError(line, posi, "invalid position for )");
					continue;
				}
			}
			else if(pre==="string") {
				if(present==="operation") {
					addError(line, posi, "number missing before " + value);
					continue;
				}
				else if(present==="," || present==="string" || present==="stringF" || present==="num" || present==="numF" || present==="sign" || present==="(") {
					break;
				}
			}
			else if(pre==="num") {
				if(present==="string" || present==="stringF" || present==="," || present==="num" || present==="numF" || present==="(") {
					break;
				}
			}
			else if(pre==="sign" || pre==="operation") {
				if(present==="sign" || present==="operation" || present==="string" || present==="stringF" || present==="," || present==="compare" || present==="and" || present==="or") {
					var precessor = this.getCurrent();
					addError(precessor.line, precessor.posi, "number missing after " + precessor.value);
					// help finish the operation
					if(pre==="sign") {
						this.addSon(["0", line, -1]);
					}
					else if(pre==="operation") {
						this.addSon(["1", line, -1]);
					}
					pre = "num";
					if(expType === "") {
						expType = "N";
					}
					i -= 1;
				}
				else if(present===")") {
					addError(line, posi, "invalid position for )");
					if(bracketNode.length>0) {
						bracketNode.pop();
					}
					continue;
				}
			}
			else if(pre==="(") {				
				if(present==="," || present==="operation" || present==="compare" || present==="and" || present==="or") {
					var precessor = this.getCurrent();
					addError(precessor.line, precessor.posi, "invalid position for (");
					// help finish the parenthesis
					this.addSon(["0", line, -1]);
					this.gotoCertainNode(bracketNode.pop());
					pre = ")";
					if(expType === "") {
						expType = "N";
					}
					i -= 1;
				}
				else if(present===")") {
					addError(line, posi, "no content in parenthesis");
					this.addSon(["0", line, -1]);
					this.gotoCertainNode(bracketNode.pop());
					pre = ")";
					if(expType === "") {
						expType = "N";
					}
				}
			}
			else if(pre===")") {
				if(present==="string" || present==="stringF" || present==="," || present==="num" || present==="numF" || present==="(") {
					break;
				}
			}
			else if(pre==="and" || pre==="or") {
				if(present==="," || present==="and" || present==="or") {
					var precessor = this.getCurrent();
					addError(precessor.line, precessor.posi, "content missing after " + precessor.value.toUpperCase());
					// help finish a boolean
					this.addSon(["", line, -1]);
					pre = ")";
					expType = "B";
					i -= 1;
				}
				else if(present==="operation") {
					addError(line, posi, "number missing before " + value);
					continue;
				}
				else if(present==="compare") {
					addError(line, posi, "content missing before " + value);
					continue;
				}
				else if(present===")") {
					addError(line, posi, "invalid position for )");
					if(bracketNode.length>0) {
						bracketNode.pop();
					}
					continue;
				}
			}
			else if(pre==="compare") {
				if(present==="," || present==="and" || present==="or") {
					var precessor = this.getCurrent();
					addError(precessor.line, precessor.posi, "content missing after " + precessor.value.toUpperCase());
					// help finish a boolean
					this.addSon(["", line, -1]);
					pre = ")";
					expType = "B";
					i -= 1;
				}
				else if(present==="operation") {
					addError(line, posi, "number missing before " + value);
					continue;
				}
				else if(present==="compare") {
					addError(line, posi, "content missing before " + value);
					continue;
				}
				else if(present===")") {
					addError(line, posi, "invalid position for )");
					if(bracketNode.length>0) {
						bracketNode.pop();
					}
					continue;
				}
			}
			else {
				console.log("unexpected situation in eatExpression, incompatible");
			}
		}
	}
	if(bracketNode.length>0) {
		addError(line, bracketNode[0].posi, "parenthesis do not match, maybe a ) is missing");
	}
	// if an expression has invalid ending
	if(i===lineArr.length) {
		if(pre==="string" || pre==="num" || pre===")" || pre===",") {
		}
		else if(pre==="(") {
			// this error must already be caught by parenthesis matching
			this.addSon(["0", line, -1]);	
			if(expType === "") {
				expType = "N";
			}
		}
		else if(pre==="sign" || pre==="operation") {
			addError(line, posi, "number missing after " + value);
			if(pre==="sign") {
				this.addSon(["0", line, -1]);
			}
			else if(pre==="operation") {
				this.addSon(["1", line, -1]);
			}				
			if(expType === "") {
				expType = "N";
			}								
		}
		else if(pre==="and" || pre==="or" || pre==="compare") {
			addError(line, posi, "content missing after " + value.toUpperCase());
			this.addSon(["", line, -1]);
			expType = "B";
		}
	}
	return [i,expType];
	
	function compatible(pre, present) {
		if(present==="other" || present==="otherF") {
			return false;
		}
		else if(pre==="start") {
			return (present==="," || present==="string" || present==="stringF" || present==="num" || present==="numF" || present==="sign" || present==="(");
		}
		else if(pre==="string" || pre==="stringF") {
			return (present==="compare" || present==="and" || present==="or" || present===")");
		}
		else if(pre===",") {
			return (present==="string" || present==="stringF" || present==="num" || present==="numF" || present==="sign" || present==="(");
		}
		else if(pre==="num" || pre==="numF") {
			return (present==="sign" || present==="operation" || present===")" || present==="compare" || present==="and" || present==="or");
		}
		else if(pre==="sign" || pre==="operation") {
			return (present==="num" || present==="numF" || present==="(");
		}
		else if(pre==="(") {
			return (present==="string" || present==="stringF" || present==="sign" || present==="(" || present==="num" || present==="numF");
		}
		else if(pre===")") {
			return (present==="sign" || present==="operation" || present===")" || present==="compare" || present==="and" || present==="or");
		}
		else if(pre==="and" || pre==="or") {
			return (present==="string" || present==="stringF" || present==="num" || present==="numF" || present==="sign" || present==="(");
		}
		else if(pre==="compare") {
			return (present==="string" || present==="stringF" || present==="num" || present==="numF" || present==="sign" || present==="(");
		}
		else {
			console.log("unrecognized type in compatible");
			return false;
		}
	}
}

Tree.prototype.eatCall = function(lineArr, i) {
	var couple = 0;
	var j = i;
	var value = lineArr[i][0]; 
	if(lineArr.length===i+1 || lineArr[i+1][0]!=="(") {
		addError(lineArr[i][1], lineArr[i][2], "the function " + value + " is not followed by valid argument");
	}
	else {
		for(j=i+1; j<lineArr.length; j++) {
			if(lineArr[j][0]==="(") {
				couple += 1;
			}
			if(lineArr[j][0]===")") {
				couple -= 1;
			}
			if(couple===0) {
				break;
			}
		}
		if(couple!==0) {
			addError(lineArr[i][1], lineArr[i][2], "the function " + value + " is not followed by valid argument, maybe a ) is missing");
			j = i;
		}
	}
	this.addSon(["functioncall", lineArr[i][1], lineArr[i][2]]);
	this.mark();
	this.addSon([this.funcTable.getLoc(value), lineArr[i][1], lineArr[i][2]]);
	this.gotoRoot();
	// defArr is the content for argument inside (), may be seperated by ,
	var defArr = lineArr.slice(i+2,j);
	if(defArr.length>0) {
		var x = 0;
		while(x<defArr.length) {
			var dot = this.eatExpression(defArr, x);
			this.gotoRoot();
			x = dot[0];	
			if(x<defArr.length) {
				if(defArr[x][0]===",") {
					if(x===defArr.length-1) {
						addError(lineArr[i+x+2][1], lineArr[i+x+2][2], "no content after ,");
					}
					x += 1;					
				}
				else {
					addError(lineArr[i+x+2][1], lineArr[i+x+2][2], "the arguments should be seperated by ,");
				}
			}
		}
	}
	this.gotoRoot();
	this.unmark();
	return j;
}

Tree.prototype.eatDo = function(lineArr) {
	if(lineArr.length<2) {
		addError(lineArr[0][1], lineArr[0][2], "missing function after DO");
		return;
	}
	var value = lineArr[1][0]; 
	if(!this.funcTable.existFunc(value)) {
		addError(lineArr[1][1], lineArr[1][2], "the function " + value + " is not defined yet");
		return;
	}
	var couple = 0;
	var i = 1;
	var j = i;	
	if(lineArr.length===i+1 || lineArr[i+1][0]!=="(") {
		addError(lineArr[i][1], lineArr[i][2], "the function " + value + " is not followed by valid argument");
	}
	else {
		for(j=i+1; j<lineArr.length; j++) {
			if(lineArr[j][0]==="(") {
				couple += 1;
			}
			if(lineArr[j][0]===")") {
				couple -= 1;
			}
			if(couple===0) {
				break;
			}
		}
		if(j+1<lineArr.length) {
			addError(lineArr[j][1], lineArr[j][2], "more than one value received after DO");
		}
		if(couple!==0) {
			addError(lineArr[i][1], lineArr[i][2], "the function " + value + " is not followed by valid argument, maybe a ) is missing");
			j = i;
		}
	}
	
	this.addSon(["functionDo", lineArr[i][1], lineArr[i][2]]);
	this.mark();
	this.addSon([this.funcTable.getLoc(value), lineArr[i][1], lineArr[i][2]]);
	this.gotoRoot();
	// defArr is the content for argument inside (), may be seperated by ,
	var defArr = lineArr.slice(i+2,j);
	if(defArr.length>0) {
		var x = 0;
		while(x<defArr.length) {
			var dot = this.eatExpression(defArr, x);
			this.gotoRoot();
			x = dot[0];	
			if(x<defArr.length) {
				if(defArr[x][0]===",") {
					if(x===defArr.length-1) {
						addError(lineArr[i+x+2][1], lineArr[i+x+2][2], "no content after ,");
					}
					x += 1;					
				}
				else {
					addError(lineArr[i+x+2][1], lineArr[i+x+2][2], "the arguments should be seperated by ,");
				}
			}
		}
	}	
	this.unmark();
	this.gotoRoot();
}

Tree.prototype.checkType = function(value) {
	if(isString(value)) {
		return "string";
	}
	else if(isNum(value)) {
		return "num";
	}
	else if(this.funcTable.existFunc(value)) {
		return this.funcTable.getType(value);
	}	
	else if(this.scope.existVar(value)) {
		return this.scope.getVar(value);
	}
	else if(value==="-" || value==="+") {
		return "sign";
	}
	else if(value==="*" || value==="/") {
		return "operation";
	}
	else if(value==="(") {
		return "(";
	}
	else if(value===")") {
		return ")";
	}
	else if(isComparison(value)) {
		return "compare";
	}
	else if(value===",") {
		return ",";
	}
	else if(value.toLowerCase()==="and") {
		return "and";
	}
	else if(value.toLowerCase()==="or") {
		return "or";
	}
	else {
		return "other";
	}
}

// check if the name of variable or function is valid, not taken, and return true if so
Tree.prototype.checkName = function(box) {
		var name = box[0];
		if(isKeyword(name)) {
			addError(box[1], box[2], "invalid name '" + name + "', conflict with keywords");
		}
		else if(isOperator(name)) {
			addError(box[1], box[2], "invalid name '" + name + "', please avoid using operators");
		}
		else if(isString(name)) {
			addError(box[1], box[2], "invalid name '" + name + "', please avoid using quotation marks");
		}
		else if(isNum(name)) {
			addError(box[1], box[2], "invalid name '" + name + "', please avoid using only number");
		}
		else if(this.scope.existNow(name)) {
			addError(box[1], box[2], "the name '" + name + "' is already taken by a variable, please try a new name");
		}
		else if(this.funcTable.existFunc(name)) {
			addError(box[1], box[2], "the name '" + name + "' is already taken by a function, please try a new name");
		}
		else {
			return true;
		}
		return false;	
}