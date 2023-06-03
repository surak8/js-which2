"use strict";

// #region required packages
const path = require("path");
const fs = require("fs");
// #endregion required packages

// #region class
class UnixWhich {
	// #region ctor
	constructor(args) {
		var sdpType;

		this._args = (args ? args : {});
		this._showDupPaths = false;
		this._debug = false;

		// Object.hasOwn ONLY WORKS AFTER 2021
		if (Object.hasOwn(this.args, "showDuplicatePaths")) {
			sdpType = typeof (this.args.showDuplicatePaths);
			if (this.debug) console.debug(`TYPE is ${sdpType}`);
			if (sdpType === "string") this._showDupPaths = this.args.showDuplicatePaths.toString() === "true";
			else if (sdpType === "boolean") this._showDupPaths = this.args.showDuplicatePaths.toString() === "true";
		}
		this._paths = this.findUniquePaths(process.env["PATH"].split(";"));
	}
	// #endregion ctor

	// #region properties
	get args() { return this._args; }
	get debug() { return this._debug; }
	get paths() { return this._paths; }
	get showDuplicatePaths() { return this._showDupPaths; }
	// #endregion properties

	// #region method
	findUniquePaths(paths) {
		var tmp, ret = [], foundItems;

		if (paths)
			if (Array.isArray(paths) && paths.length > 0) {
				tmp = paths.sort();
				for (const thisPath of tmp) {
					foundItems = ret.filter(aPath => aPath === thisPath);
					if (foundItems.length < 1) ret.push(thisPath);
					else if (this.showDuplicatePaths) console.warn("duplicate path: " + thisPath);
				}
			}
		return ret;
	}

	makeExecVector(item) {
		if (item) {
			if (path.extname(item) !== "")
				return [item];
			return ["BAT", "COM", "CMD", "EXE"].map((anExtension) => item + "." + anExtension);
		}
		return [];
	}

	findItemsInPath(item) {
		var filesToFind, afile, ret = [];

		if (item) {
			filesToFind = this.makeExecVector(item);

			if (this.paths && this.paths.length > 0)
				this.paths.forEach(currentPath => {
					filesToFind.forEach(anItem => {
						if (fs.existsSync(afile = path.resolve(path.join(currentPath, anItem))))
							ret.push(afile);
					});
				});
			return ret;
		} else
			console.warn("item is null");
		return [];
	}

	doWhich(itemsToFind) {
		var ret = [], results;

		if (itemsToFind)
			if (Array.isArray(itemsToFind))
				if (itemsToFind.length > 0) {
					itemsToFind.forEach(
						anItem => {
							results = this.findItemsInPath(anItem);
							if (results && results.length > 0) {
								// "..." is the 'spread operator', implying something is iterable.
								ret = [...ret, ...results];
							}
						});
				} else console.warn(" items-to-find is null");
			else console.warn("version-2");
		else console.warn("version-3");
		return ret;
	}
	// #endregion method

}
// #endregion class

// #region main-line function
/*
* main - line function
*/
function main() {
	var result, disp = "";

	process.exitCode = 1;
	//result = new UnixWhich({ showDuplicatePaths: false }).doWhich(process.argv.slice(2));
	result = new UnixWhich({ showDuplicatePaths: false, debug: true }).doWhich(process.argv.slice(2));
	if (result && result.length > 0) {
		process.exitCode = 0;
		result.forEach(aresult => disp += (aresult + "\r\n"));
		console.log(disp);
	}
}
// #endregion main-line function

main();
