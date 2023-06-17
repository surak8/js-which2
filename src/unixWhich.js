const EventEmitter = require("events");
const path = require("path");
const fs = require("fs");
const semver = require("semver"); // semantic version comparator

const FIELD_NAME = "showDuplicatePaths";
// #region class
class UnixWhich {
	// #region ctor
	constructor(args) {
		var sdpType, nodeVersion, haveProperty;

		this._args = (args ? args : {});
		this._showDupPaths = false;
		this._debug = false;
		this._emitter = new EventEmitter();

		// process.version contains the current version of NODE.
		nodeVersion = (process.version.startsWith("v")) ?
			process.version.substring(1) :
			process.version;

		// 18.15.0 WORKS!
		// 14.17.0 -- no
		// 14.10.0 -- no
		// 13.14.0 -- no
		// 12.22.12 -- no
		// 12.22.0 -- no
		console.log(
			`node-version=${nodeVersion}\r\n` +
			`current=${nodeVersion}\r\n`
		);
		if (semver.eq(nodeVersion, "12.3.1")) {
			console.warn("using 'hasOwnProperty'");
			haveProperty = Object.prototype.hasOwnProperty.call(this.args, FIELD_NAME);
		} else {
			console.warn("using 'hasOwn'");
			haveProperty = Object.hasOwn(this.args, FIELD_NAME);
		}

		console.log(`version=${nodeVersion}, haveProp=${haveProperty}`);

		//// Object.hasOwn ONLY WORKS AFTER 2021
		//if (Object.hasOwn(this.args, FIELD_NAME)) {
		//	sdpType = typeof (this.args.showDuplicatePaths);
		//	if (this.debug) console.debug(`TYPE is ${sdpType}`);
		//	if (sdpType === "string") this._showDupPaths = this.args.showDuplicatePaths.toString() === "true";
		//	else if (sdpType === "boolean") this._showDupPaths = this.args.showDuplicatePaths.toString() === "true";
		//}

	}
	// #endregion ctor

	// #region properties
	get emitter() { return this._emitter; }
	get args() { return this._args; }
	get debug() { return this._debug; }
	get paths() { return this._paths; }
	get showDuplicatePaths() { return this._showDupPaths; }
	// #endregion properties

	findUniquePaths(paths) {
		var tmp, ret = [], foundItems;

		if (paths)
			if (Array.isArray(paths) && paths.length > 0) {
				tmp = paths.sort();
				for (const thisPath of tmp) {
					foundItems = ret.filter(aPath => aPath === thisPath);
					if (foundItems.length < 1) ret.push(thisPath);
					else this.emitter.emit("duplicateItem", thisPath);
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

		this._paths = this.findUniquePaths(process.env["PATH"].split(";"));
		if (itemsToFind)
			if (Array.isArray(itemsToFind))
				if (itemsToFind.length > 0) {
					itemsToFind.forEach(
						anItem => {
							results = this.findItemsInPath(anItem);
							if (results && results.length > 0) {
								results.forEach(aresult => this.emitter.emit("foundItem", aresult));
								// "..." is the 'spread operator', implying something is iterable.
								ret = [...ret, ...results];
							}
						});
				} else console.warn(" items-to-find is null");
			else console.warn("version-2");
		else console.warn("version-3");
		return ret;
	}
	registerEvent(eventName, eventCallback) {
		this.emitter.on(eventName, eventCallback);
		return this;
	}
	// #endregion method

}
// #endregion class

module.exports = {
	UnixWhich
};
