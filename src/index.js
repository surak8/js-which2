"use strict";

// #region required packages
const { UnixWhich } = require("./unixWhich");
// #endregion required packages

// #region main-line function
/*
* main - line function
*/
function main() {
	var result, disp = "", foundItems = [], dupPaths = [];

	process.exitCode = 1;
	foundItems = [];
	result = new UnixWhich({ showDuplicatePaths: false, debug: true })
		.registerEvent("foundItem", (item) => { foundItems.push(item); })
		.registerEvent("duplicateItem", (item) => { dupPaths.push(item); })
		.doWhich(process.argv.slice(2));
	if (result && result.length > 0) {
		process.exitCode = 0;
		result.forEach(aresult => disp += (aresult + "\r\n"));
		console.log(disp);
	}
}
// #endregion main-line function

main();
