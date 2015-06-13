
Tree.prototype.go = function() {
	this.goNode(this.root[0]);
}

Tree.prototype.counterFunction = 0;
Tree.prototype.counterRepeat = 0;
Tree.prototype.counterFor = 0;

Tree.prototype.goNode = function(node) {
	if(node.value==="start") {
		for(var s in node.sons) {
			this.goNode(node.sons[s]);
		}
	}
	else if(node.value==="function") {
		return;
	}
	else if(node.value==="return") {		
		this.funcTable.returnBox = [];
		if(node.sons.length>0) {
			var fruit = this.goNode(node.sons[0]);			
			this.funcTable.returnBox.push(fruit);
		}
		this.stack.removeLayer();
		return "terminateReturn";
	}
	else if(node.value==="break") {
		return "terminateBreak";
	}
	else if(node.value==="startFunc") {
		// check if reach maximun function times
		this.counterFunction += 1;
		var limit = 1000;
		if(this.counterFunction>limit) {
			addError(node.line, node.posi, "reach limit of " + limit + " function call");
			return;
		}
		// terminate is to stop function when it already return, or the arguments not valid
		var terminate = "";
		for(var s in node.sons) {		
			terminate = this.goNode(node.sons[s]);
			if(terminate==="terminateReturn") {
				return;
			}
		}
		// if a function is ended without return
		this.stack.removeLayer();
	}
	else if(node.value==="repeat") {
		// check if reach maximun repeat times
		this.counterRepeat += 1;
		var limit = 1000;
		if(this.counterRepeat>limit) {
			addError(node.line, node.posi, "reach limit of " + limit + " repeat");
			return;
		}
		// terminate is to stop repeat when it break
		var terminate = "";
		for(var s in node.sons) {		
			terminate = this.goNode(node.sons[s]);
			if(terminate==="terminateBreak") {
				return;
			}
		}
	}
	else if(node.value==="for") {
		// if For command is invalid, it has less than 5 sons. name, initial, destination, step, forloop
		if(node.sons.length>4) {
			var name = node.sons[0].value;
			var initial = this.goNode(node.sons[1]);
			var destination = this.goNode(node.sons[2]);
			var step = this.goNode(node.sons[3]);
			this.stack.addVar(name, initial);
			var terminate = "";
			if(step>0) {
				while(this.stack.getVar(name)<=destination) {
					terminate = this.goNode(node.sons[4]);
					if(terminate==="terminateBreak") {
						return;
					}
					this.stack.setVar(name, this.stack.getVar(name)+step);
				}
			}
			else {
				while(this.stack.getVar(name)>=destination) {
					terminate = this.goNode(node.sons[4]);
					if(terminate==="terminateBreak") {
						return;
					}
					this.stack.setVar(name, this.stack.getVar(name)+step);
				}
			}
		}
	}
	else if(node.value==="forloop") {
		// check if reach maximun function times
		this.counterFor += 1;
		var limit = 1000;
		if(this.counterFor>limit) {
			addError(node.line, node.posi, "reach limit of " + limit + " for loop");
			return;
		}
		// terminate is to stop for when it break
		var terminate = "";
		for(var s in node.sons) {		
			terminate = this.goNode(node.sons[s]);
			if(terminate==="terminateBreak") {
				return terminate;
			}
		}
	}
	else if(node.value==="if") {
		var terminate = "";
		if(node.sons.length===2) {
			var flag = this.goNode(node.sons[0]);
			if(flag==="" || flag===true) {
				terminate = this.goNode(node.sons[1]);
			}
		}
		else if(node.sons.length===3) {
			var flag = this.goNode(node.sons[0]);
			if(flag==="" || flag===true) {
				terminate = this.goNode(node.sons[1]);
			}
			else {
				terminate = this.goNode(node.sons[2]);
			}
		}
		if(terminate==="terminateReturn" || terminate==="terminateBreak") {
			return terminate;
		}
	}
	else if(node.value==="then" || node.value==="else") {
		var terminate = "";
		for(var s in node.sons) {
			terminate = this.goNode(node.sons[s]);
			if(terminate==="terminateReturn" || terminate==="terminateBreak") {
				return terminate;
			}
		}
	}
	else if(node.value==="continue") {
		this.goNode(node.sons[0].value);
	}
	else if(node.value==="functioncall") {
		var fruits = [];
		if(node.sons.length>1) {
			for(var i=1; i<node.sons.length; i++) {
				fruits.push(this.goNode(node.sons[i]));
			}
		}
		this.funcTable.defBox = fruits;
		// add the loc information at the rear of defBox, so error message point to the functioncall
		this.funcTable.defBox.push(node);
		this.goNode(node.sons[0].value);
		if(this.funcTable.returnBox.length>0) {
			if(this.funcTable.returnBox.length>1) {
				console.log("returnBox over crowded");
			}
			return this.funcTable.returnBox.pop();
		}
		else {
			var funcName = this.funcTable.getName(node.sons[0].value);
			addError(node.line, node.posi, "no return value from function " + funcName);
			if(this.checkType(funcName)==="numF") {
				return 0;
			}
			else if(this.checkType(funcName)==="stringF") {
				return '"%"';
			}
		}
	}
	else if(node.value==="functionDo") {
		var fruits = [];
		if(node.sons.length>1) {
			for(var i=1; i<node.sons.length; i++) {
				fruits.push(this.goNode(node.sons[i]));
			}
		}
		this.funcTable.defBox = fruits;
		// add the loc information at the rear of defBox, so error message point to the functioncall
		this.funcTable.defBox.push(node);
		this.goNode(node.sons[0].value);
		if(this.funcTable.returnBox.length>0) {
			if(this.funcTable.returnBox.length>1) {
				console.log("returnBox over crowded");
			}
			this.funcTable.returnBox.pop();
		}
	}
	else if(node.value==="defFunc") {		
		var call = this.funcTable.defBox[this.funcTable.defBox.length-1];
		if(node.sons.length!==this.funcTable.defBox.length-1) {			
			addError(call.line, call.posi, "number of arguments does not match with function definition");
			return "terminate";
		}
		this.stack.addLayer();
		for(var i=0; i<node.sons.length; i++) {
			if(node.sons[i].value==="number") {
				if(isNum(this.funcTable.defBox[i].toString())) {
					this.stack.addVar(node.sons[i].sons[0].value, this.funcTable.defBox[i]);
				}
				else {
					addError(call.line, call.sons[i+1].posi, "invalid type of argument, number expected");
					return "terminate";
				}
			}
			else if(node.sons[i].value==="text") {
				if(isString(this.funcTable.defBox[i].toString())) {
					this.stack.addVar(node.sons[i].sons[0].value, this.funcTable.defBox[i]);
				}
				else {
					addError(call.line, call.sons[i+1].posi, "invalid type of argument, text expected");
					return "terminate";
				}
			}
		}
	}
	else if(node.value==="print") {
		var fruits = [];
		for(var s in node.sons) {
			var fruit = this.goNode(node.sons[s]);
			if (typeof fruit === "undefined") {
				continue;
			}
			else {
				fruit = fruit.toString();
			}
			if(isString(fruit)) {
				fruits.push(fruit.slice(1, fruit.length-1));
			}
			else {
				fruits.push(fruit);
			}
		}
		
		GlobalResult += fruits.join("") + "\n";
	}
	else if(node.value==="complain") {
		// when complain is not followed by text, it has no son
		if(node.sons.length>0) {
			var fruit = this.goNode(node.sons[0]);
			alert(fruit.slice(1, fruit.length-1));
		}
	}
	else if(node.value==="number") {
		if(node.sons.length===1) {
			this.stack.addVar(node.sons[0].value, "emptyN");
		}
		else if(node.sons.length===2) {
			this.stack.addVar(node.sons[0].value, this.goNode(node.sons[1]));
		}
	}
	else if(node.value==="text") {
		if(node.sons.length===1) {
			this.stack.addVar(node.sons[0].value, "emptyS");
		}
		else if(node.sons.length===2) {
			this.stack.addVar(node.sons[0].value, this.goNode(node.sons[1]));
		}
	}
	else if(node.value==="let") {
		// when LET has type confliction, it has only one son
		if(node.sons.length>1) {
			var name = node.sons[0].value;
			if(!this.stack.existVar(name)) {
				addError(node.line, node.posi, "the variable " + name + " has not been defined yet");
			}
			else {
				this.stack.setVar(node.sons[0].value, this.goNode(node.sons[1]));
			}
		}
	}
	else if(node.value==="input") {
		// when INPUT is not followed by text, it has only one son
		if(node.sons.length>1) {
			var name = node.sons[1].value;
			if(!this.stack.existVar(name)) {
				addError(node.line, node.posi, "the variable " + name + " has not been defined yet");
			}
			else {
				var display = this.goNode(node.sons[0]);				
				var fruit = window.prompt(display.slice(1, display.length-1));
				// either click cancle or without input
				if(fruit === null || fruit.length<1) {
					console.log("no input");
				}
				else {
					// if variable is text, add " surrounding input
					if(node.sons[2].value === "string") {
						fruit = '"' + fruit + '"';
						this.stack.setVar(name, fruit);
					}
					// if variable is number, check input is number
					else {
						if(isNum(fruit)) {
							fruit = Number(fruit);
							if(!isNaN(fruit)) {
								this.stack.setVar(name,fruit);
								return;
							}
						}
						addError(node.line, node.posi, "user input is not valid number");
						this.stack.setVar(name,0);
					}
				}
			}
		}
	}
	
	else if(isString(node.value)) {
		return node.value;
	}
	else if(isNum(node.value)) {
		var fruit = Number(node.value);
		if(isNaN(fruit)) {
			addError(node.line, node.posi, node.value + " is not a valid number");
			fruit = 0;
		}
		return fruit;
	}
	else if(this.stack.existVar(node.value)) {
		if(this.stack.getVar(node.value)==="emptyN") {
			addError(node.line, node.posi, node.value + " does not have a value yet");
			return 0;
		}
		else if(this.stack.getVar(node.value)==="emptyS") {
			addError(node.line, node.posi, node.value + " does not have a value yet");
			return '"%"';
		}
		else {
			return this.stack.getVar(node.value);
		}
	}
	else if(node.value===",") {
		return "	";
	}
	// "" is parsed when missing component for boolean expression
	else if(node.value==="") {
		return "";
	}
	
	else if(node.value==="*") {
		var fruits = [];
		for(var s in node.sons) {
			fruits.push(this.goNode(node.sons[s]));
		}
		return fruits[0] * fruits[1];
	}
	else if(node.value==="/") {
		var fruits = [];
		for(var s in node.sons) {
			fruits.push(this.goNode(node.sons[s]));
		}
		if(fruits[1]===0) {
			addError(node.line, node.posi, "can not devide by 0");
			return fruits[0];
		}
		return fruits[0] / fruits[1];
	}
	else if(node.value==="+") {
		var fruits = [];
		for(var s in node.sons) {
			fruits.push(this.goNode(node.sons[s]));
		}
		return fruits[0] + fruits[1];
	}
	else if(node.value==="-") {
		var fruits = [];
		for(var s in node.sons) {
			fruits.push(this.goNode(node.sons[s]));
		}
		return fruits[0] - fruits[1];
	}
	else if(node.value===">" || node.value==="<" || node.value===">=" || node.value==="<=" || node.value==="<>" || node.value==="=") {
		var fruits = [];
		for(var s in node.sons) {
			fruits.push(this.goNode(node.sons[s]));
		}
		if(fruits[0]==="" || fruits[1]==="") {
			return true;
		}
		if(isString(fruits[0].toString())) {
			if(!isString(fruits[1].toString())) {
				addError(node.line, node.posi, "unmatched type, the value on right side of " + node.value + " should be text");
				return true;
			}
		}
		else if(isNum(fruits[0].toString())) {
			if(!isNum(fruits[1].toString())) {
				addError(node.line, node.posi, "unmatched type, the value on right side of " + node.value + " should be number");
				return true;
			}
		}
		else {
			console.log(fruits[0].toString());
			addError(node.line, node.posi, "invalid value on left side of " + node.value + ", it should be number or text");
			return true;
		}
		switch (node.value) {
			case ">":
				return fruits[0] > fruits[1];
			case "<":
				return fruits[0] < fruits[1];
			case ">=":
				return fruits[0] >= fruits[1];
			case "<=":
				return fruits[0] <= fruits[1];
			case "<>":
				return fruits[0] !== fruits[1];
			case "=":
				return fruits[0] === fruits[1];
		}
	}
	else if(node.value==="and" || node.value==="or") {
		var fruits = [];
		for(var s in node.sons) {
			fruits.push(this.goNode(node.sons[s]));
		}
		if(fruits[0]==="" || fruits[1]==="") {
			return true;
		}
		if(fruits[0]!==true && fruits[0]!==false) {
			addError(node.line, node.posi, "no valid condition on left side of " + node.value);
			return true;
		}
		if(fruits[1]!==true && fruits[1]!==false) {
			addError(node.line, node.posi, "no valid condition on right side of " + node.value);
			return true;
		}
		switch (node.value) {
			case "and":
				return fruits[0] && fruits[1];
			case "or":
				return fruits[0] || fruits[1];
		}
	}	
	else if(node.value==="(") {
		return this.goNode(node.sons[0]);
	}
	
	else {
		console.log("unrecognied node at " + node.id);
	}
}