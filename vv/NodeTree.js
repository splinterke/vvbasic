// NodeTree.js include Objects to build a parsetree.
// Tree is the structure of parsetree
// Node is element in Tree which contains value and relation
// Stack is the structure to keep track of definition of variables
// FuncTable is the structure to keep track of definition of functions


// Node contains information: 
// "id" is its name in the tree, start from "node0"
// "value" is the string form input
// "father" and "sons" are other Nodes linked with it
// "line" and "posi" are location information, used in error message
function Node(value, id, line, posi) {
	this.id = id;
	this.value = value;
	this.line = line;
	this.posi = posi;
	this.father = this;
	this.sons = [];
	
	this.registerSon = function(s) {
		this.sons.push(s);
	}
	this.registerFather = function(f) {
		this.father = f;
	}
}


function Tree() {
	
	// count keep track of how many nodes are in the tree; it is also used to give name to new node
	var count = -1;
	
	// a box is a package of information containing [value, line_num, posi_num]
	this.newNode = function(box) {
		count += 1;
		var id = "node" + count;
		this[id] = new Node(box[0], id, box[1], box[2]);
		return this[id];
	}
	
	// initial the first node, which is only a signal
	// "currNode" act as a pointer of current Node, move while building parsetree
	var currNode = this.newNode(["start", 0, 0]);
	
	// "root[]" record where to go back after building a branch, which is used in REPEAT and IF
	this.root = [];
	this.root.push(currNode);
	// "rootType[]" record type of root, to prevent mistakes in ENDREPEAT and ENDIF
	this.rootType = [];
	
	// "repeatNode[]" record where to go back in command REPEAT
	this.repeatNode = [];
	
	// "scope{}" is to record variable with their types during compiling
	this.scope = new Stack();
	// "stack{}" is to record variable with their values during running
	this.stack = new Stack();
	// "funcTable" is to record function with their return-type and node-location
	this.funcTable = new FuncTable();
	
	this.addSon = function(box) {
		var son = this.newNode(box);
		currNode.registerSon(son);
		son.registerFather(currNode);
		currNode = son;
	}
	
	this.getCurrent = function() {
		return currNode;
	}
	
	this.gotoCertainNode = function(node) {
		currNode = node;
	}
	
	this.getFather = function() {
		return currNode.father;
	}
	
	this.gotoFather = function() {
		currNode = currNode.father;
	}
	
	this.insertFather = function(box) {
		var father = this.newNode(box);
		var grandpa = this.getFather();
		currNode.registerFather(father);
		father.registerFather(grandpa);
		father.registerSon(currNode);
		for(var s in grandpa.sons) {
			if(grandpa.sons[s] === currNode) {
				grandpa.sons[s] = father;
			}
		}
		currNode = father;
	}
	
	this.mark = function() {
		this.root.push(currNode);
	}
	
	this.unmark = function() {
		this.root.pop();
	}
	
	this.gotoRoot = function() {
		currNode = this.root[this.root.length-1];
	}
	
	this.discardLastSon = function() {
		currNode.sons.pop();
	}
}

// Stack() is the object to store layers of variables. The inner layer has access to outer ones, but outer layer has no access to inner ones.
// The array "layers" store different layers, and each layer is a dictionary.
// The operation existVar, getVar and setVar must search through all outer layers.
function Stack() {
	this.layers = [];
	this.layers.push({});
	
	this.addLayer = function() {
		this.layers.push({});
	}
	this.removeLayer = function() {
		this.layers.pop();
	}
	this.addVar = function(name, value) {
		name = name.toLowerCase();
		this.layers[this.layers.length-1][name] = value;
	}
	this.existVar = function(name) {
		name = name.toLowerCase();
		var result = false;
		for(var i=this.layers.length-1; i>=0; i--) {
			if(this.layers[i].hasOwnProperty(name)) {
				result = true;
				break;
			}
		}
		return result;
	}
	this.existNow = function(name) {
		name = name.toLowerCase();
		var result = false;
		if(this.layers[this.layers.length-1].hasOwnProperty(name)) {
			result = true;
		}
		return result;
	}
	this.setVar = function(name, value) {
		name = name.toLowerCase();
		for(var i=this.layers.length-1; i>=0; i--) {
			if(this.layers[i].hasOwnProperty(name)) {
				this.layers[i][name] = value;
				break;
			}
		}
	}
	this.getVar = function(name) {
		name = name.toLowerCase();
		for(var i=this.layers.length-1; i>=0; i--) {
			if(this.layers[i].hasOwnProperty(name)) {
				return this.layers[i][name];
			}
		}
	}
}


function FuncTable() {
	// following four elements are for compiling time
	this.names = [];
	this.locs = [];
	this.types = [];
	// curr is a stack for current un-ended functions, used in situation "function inside function"
	this.curr = [];
	
	// following four elements are for running time
	// defBox is used to pass by values of arguments
	this.defBox = [];
	// returnBox is used to pass by return values
	this.returnBox = [];
	
	this.addFunc = function(name, node) {
		name = name.toLowerCase();
		this.names.push(name);		
		this.locs.push(node);
		this.types.push("otherF");
		
		this.curr.push(name);
	}
	this.existFunc = function(name) {
		name = name.toLowerCase();
		var index = this.names.indexOf(name);
		if(index !== -1) {
			return true;
		}
		return false;
	}
	this.passFunc = function() {
		this.curr.pop();
	}
	this.existCurr = function(name) {
		name = name.toLowerCase();
		if(this.curr.indexOf(name)===-1) {
			return false;
		}
		return true;
	}
	this.setType = function(t) {
		var index = this.names.indexOf(this.curr[this.curr.length-1]);
		if(t!=="otherF" && this.types[index]==="otherF") {
			this.types[index] = t;
		}
		else if(this.types[index]!==t) {
			return false;
		}
		return true;
	}
	this.getType = function(name) {
		name = name.toLowerCase();
		var index = this.names.indexOf(name);
		return this.types[index];
	}
	this.getLoc = function(name) {
		name = name.toLowerCase();
		var index = this.names.indexOf(name);
		return this.locs[index];
	}
	this.getName = function(loc) {
		var index = this.locs.indexOf(loc);
		return this.names[index];
	}

	this.show = function() {
		var s = ""
		for(var i=0; i<this.names.length; i++) {
			s += this.names[i] + ", " + this.locs[i].id + ", " + this.types[i] + "\n";
		}
		return s;
	}
}
