// Scanner.js read user input and produce a string[][], based on which a parsetree will be built later

// cut the input into lines
function read(content) {
	var lines = content.split('\n');
	var result = [];
	for(var i in lines) {
		result.push( readLine(lines[i], Number(i)+1) );
	}
	return result;
}

// cut the line into words
// then package words with location information
// special_case_1 do not cut inside "..."
// special_case_2 2+4 may stick together but need to be cut
// special_case_3 <= should be read together, while <>= should not
function readLine(line, line_num) {
	
	var head = 0;
	var rear = 0;
	// result contains [value, line_num, posi_num], which will be refered as "box" in the future 
	var result = [];
	// quote indicate if currently between "..."
	var quote = false;
	while(rear<line.length) {
		// when not in a quote, cut when see a space
		if(line.charAt(rear)===" " && !quote) {
			if(rear>head) {
				result.push([line.slice(head, rear), line_num, head]);
			}
			head = rear+1;
		}
		// when not in a quote and meet a ", modify quote into true
		else if(line.charAt(rear)==='"' && !quote) {
			quote = !quote;
			if(rear>head) {
				result.push([line.slice(head, rear), line_num, head]);
			}
			head = rear;
		}
		// when not in a quote, cut when see + etc.
		else if(!quote && (line.charAt(rear)==='+' || line.charAt(rear)==='-' || line.charAt(rear)==='*' || line.charAt(rear)==='/' || line.charAt(rear)==='(' || line.charAt(rear)===')' || line.charAt(rear)===','  || line.charAt(rear)==='>'  || line.charAt(rear)==='<'  || line.charAt(rear)==='=')) {
			if(rear>head) {
				result.push([line.slice(head, rear), line_num, head]);
			}
			// together indicate if this char should be concat with the last one
			var together = false;
			if(result.length>0) {
				// draw the last char and check if they should be concat
				var pre = result[result.length-1];
				if(pre[0]==="<") {
					if(line.charAt(rear)==='=' || line.charAt(rear)==='>') {
						together = true;
					}
				}
				else if(pre[0]===">") {
					if(line.charAt(rear)==="=") {
						together = true;
					}	
				}
				if(together) {
					result.pop();
					result.push([pre[0]+line.charAt(rear), pre[1], pre[2]]);
				}
			}
			
			if(!together) {
				result.push([line.slice(rear, rear+1), line_num, rear]);
			}
			head = rear+1;
		}
		else if(line.charAt(rear)==='"' && quote) {
			quote = !quote;
			result.push([line.slice(head, rear+1), line_num, head]);
			head = rear+1;
		}
		
		rear += 1;
	}
	if(rear>head) {
		result.push([line.slice(head, rear), line_num, head]);
	}
	
	// finally check if " matches
	if(quote) {
		addError(line_num, head, "number of quotation marks does not match, perhaps a " + '"' + " is missing");
		return result;
	}
	
	return result;
}