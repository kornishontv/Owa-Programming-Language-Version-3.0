let { writeFileSync, readFileSync } = require("node:fs");
let { execSync } = require("child_process");
let commandsname = [];
let commandscode = [];
let namevars = [];
let contentvars = [];
let modulesused = [];
function corate(str, min, max){
	let newstr = "";
	for (let i = min; i < max; i++){
		newstr += str[i];
	}
	return newstr;
}
function dlsymstr(str, strsyms){
	for (let i = 0; i < strsyms.length; i++){
		str = str.replace(strsyms[i], "");
	}
	return str;
}
function ignoresymbol(str, symbol){
	let newstr = "";
	for (let i = 0; i < str.length; i++){
		let sym = str[i];
		if (sym != symbol){
			newstr += sym;
		}
	}
	return newstr;
}
function ignoresymbols(str, symbols){
	for (let i = 0; i < symbols.length; i++){
		str = ignoresymbol(str, symbols[i]);
	}
	return str;
}
let libs = "";
try {
	libs = readFileSync("libsdir").toString();
}
catch {
	
}
libs = ignoresymbols(libs, "\r").split("\n");
function getpathoflib(namelib){
	for (let i = 0; i < libs.length; i++){
		let lib = libs[i].split(" ");
		let name = lib[0];
		let dirlib = lib[1];
		if (name == namelib){
			return dirlib;
		}
	}
}
function setvar(namevar, value){
	for (let i = 0; i < namevars.length; i++){
		if (namevars[i] == namevar){
			contentvars[i] = value;
			return;
		}
	}
	namevars.push(namevar);
	contentvars.push(value);
}
function parsestr(code){
	let com = "";
	let con = "";
	let pasti = 0;
	let isvar = false;
	for (let i = 0; i < code.length; i++){
		let sym = code[i];
		if (sym == " "){
			pasti = i;
			break;
		}
		else {
			com += sym;
		}
	}
	for (let i = pasti + 1; i < code.length; i++){
		let sym = code[i];
		if (sym == "=" && code[i + 1] != "="){
			isvar = true;
		}
		con += sym;
	}
	com = com.trim();
	let isstr = false;
	let isvarpr = false;
	let ende = 0;
	if (isvar){
		let nvcv = [];
		let nvcvstr = "";
		for (let i = 0; i < code.length; i++){
			let sym = code[i];
			if (sym == "\""){
				isstr = !isstr;
			}
			if (!isstr && sym == "="){
				nvcv.push(nvcvstr.trim());
				nvcvstr = "";
				ende = i;
				break;
			}
			else if (!isstr){
				nvcvstr += sym;
			}
		}
		nvcvstr = "";
		for (let i = ende + 1; i < code.length; i++){
			nvcvstr += code[i];
		}
		nvcv.push(nvcvstr.trim());
		if (nvcv.length > 1){
			let nv = nvcv[0].trim();
			let cv = ignoresymbols(nvcv[1].trim(), "\"");
			for (let i = 0; i < namevars.length; i++){
				if (namevars[i] == nv){
					contentvars[i] = cv;
					return;
				}
			}
			namevars.push(nv);
			contentvars.push(cv);
			return;
		}
	}
	let args = [];
	let strarg = "";
	let nv = "";
	isstr = false;
	isvarpr = false;
	for (let i = 0; i < con.length; i++){
		let sym = con[i];
		if (sym == "\"" && isstr){
			args.push(strarg);
			strarg = "";
			isstr = false;
		}
		else if (sym == "\"" && !isstr){
			isstr = true;
		}
		else if (isstr){
			strarg += sym;
		}
		if (sym == ")"){
			let cv = "";
			for (let j = 0; j < namevars.length; j++){
				if (namevars[j] == nv){
					cv = contentvars[j];
					break;
				}
			}
			args.push(cv);
			isvarpr = false;
			nv = "";
		}
		else if (sym == "("){
			isvarpr = true;
		}
		else if (isvarpr){
			nv += sym;
		}
	}
	if (com.toLowerCase() == "использовать"){ // add functions modules to programm
		for (let i = 0; i < args.length; i++){
			let lib = readFileSync(getpathoflib(args[i])).toString();
			lib = ignoresymbols(lib, "\n\r\t");
			let funcn = "func";
			let funclen = funcn.length;
			let pos = 0;
			let namefunc = "";
			let contentfunc = "";
			for (let j = 0; j < lib.length; j++){
				let iffunc = "";
				for (let k = j; k < funclen + j; k++){
					iffunc += lib[k];
				}
				if (iffunc == "func"){
					pos = j + funclen;
					break;
				}
			}
			for (let j = pos + 1; j < lib.length; j++){
				let sym = lib[j];
				if (sym == "{"){
					pos = j;
					break;
				}
				else {
					namefunc += sym;
				}
			}
			for (let j = pos + 2; j < lib.length; j++){
				let sym = lib[j - 1];
				let iffunc = "";
				for (let k = j; k < funclen + j; k++){
					iffunc += lib[k];
				}
				if (iffunc == funcn){
					break;
				}
				else {
					contentfunc += sym;
				}
			}
			commandsname.push(namefunc);
			commandscode.push(contentfunc);
		}
	}
	for (let i = 0; i < commandsname.length; i++){
		let commandname = commandsname[i];
		let commandcode = commandscode[i];
		if (com == commandname){
			let argst = "";
			for (let i = 0; i < args.length; i++){
				if (i != args.length - 1){
					argst += "\"" + args[i] + "\", ";
				}
				else {
					argst += "\"" + args[i] + "\"";
				}
			}
			return `args = [` + argst + `];
` + commandcode + `
`;
		}
	}
}
function modulesinit(code){
	let strings = ignoresymbols(code, "\n\t\r\"").split(";");
	for (let i = 0; i < strings.length - 1; i++){
		let string = strings[i].trim();
		let cc = string.split(" ");
		let com = cc[0].trim();
		let con = cc[1].trim();
		if (com == "использовать"){
			modulesused.push(con);
		}
	}
}
let coms = process.argv[2].toLowerCase();
let name = process.argv[3];
if (name == undefined){
	console.log("FATAL ERROR: Input file not specified");
	process.exit();
}
let file = readFileSync(name).toString();
let filelen = file.length;
let loopesname = ["бесконечно", "от "];
let loopescode = [`
while (true){
	eval(parsestr(codecycle));
}
`, `
let nums = "0123456789";
let otdostr = "";
let numslen = nums.length;
for (let j = 0; j < filelen; j++){
	let sym = file[j];
	for (let k = 0; k < numslen; k++){
		let num = nums[k];
		if (sym == num){
			otdostr += sym;
			break;
		}
		else if (sym == "д" && file[j + 1] == "о"){
			otdostr += " ";
			break;
		}
	}
}
let otdo = otdostr.split(" ");
let otdolen = otdo.length;
for (let j = 0; j < otdolen; j++){
	otdo[j] = Number(otdo[j]);
}
let strings = ignoresymbols(codecycle, \"\\n\\r\").split(";");
let stringslen = strings.length;
for (let j = otdo[0]; j <= otdo[1]; j++){
	for (let k = 0; k < stringslen; k++){
		setvar("i", String(j));
		eval(parsestr(strings[k]));
	}
}
`];
let ccm = "";
modulesinit(file); // initializing modules
for (let i = 0; i < modulesused.length; i++){
	ccm += `использовать "` + modulesused[i] + `"
`;
}
eval(parsestr(ccm));
file = ignoresymbols(file, "\n\r");
strings = file.split(";");
if (coms == "compile"){
	for (let i = 0; i < strings.length; i++){
		let string = strings[i];
		writeFileSync("compile.js", parsestr(string));
	}
	process.stdout.write(execSync("pkg -t node14-win compile.js").toString().trim());
}
else if (coms == "interpret"){
	for (let i = 0; i < loopesname.length; i++){
		let loopname = loopesname[i];
		let loopnamelen = loopname.length;
		let loopcode = loopescode[i];
		let cyclestr = "";
		for (let j = 0; j < filelen; j++){
			let lpncode = "";
			for (let k = j; k < j + loopnamelen; k++){
				lpncode += file[k];
			}
			if (lpncode == loopname){
				for (let k = j; k < filelen; k++){
					cyclestr += file[k];
					if (file[k] == "}"){
						break;
					}
				}
			}
		}
		let cycle = ignoresymbols(cyclestr, "\n\r\t}").split("{");
		let namecycle = cycle[0].trim();
		try {
			let codecycle = cycle[1].trim();
			let pos = 0;
			for (let j = 0; j < loopesname.length; j++){
				if (loopesname[j] == loopname){
					pos = j;
					break;
				}
			}
			eval(loopescode[pos]);
		}
		catch {
			
		}
	}
	for (let i = 0; i < strings.length; i++){
		let string = strings[i];
		eval(parsestr(string));
	}
}
else if (coms == "help"){
	console.log(`compile - Compile the code of exe file for public
interpret - Interpet a code for debugging`);
}
else {
	console.log("undefined command see help for help.");
}