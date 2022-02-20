import Critter from './critters/Critter.js';
import Bouncer from './critters/Bouncer.js';
import Thinker from './critters/Thinker.js';

// -------- Simulator class -------- //

// runs a single generation of simulation
// holds simulation state such as play/pause and speed information
// holds main array of critters
export default class Simulator {
	constructor(canvas, opts, cb, critters) {
		// private properties
		this._paused = true;
		this._interval; // will hold the setInterval object that runs the main step function
		this._defaultDelay = opts.defaultDelay; // default millisecond interval delay between steps
		this._delay = this._defaultDelay; // set interval to default interval delay
		this._maxDelay = this._defaultDelay * 64 || 1600; // max interval delay
		this._minDelay = this._defaultDelay / 4 || 50; // min interval delay

		// public properties
		this.canvas = canvas;
		this.context = this.canvas.getContext("2d");
		this.cellSize = opts.cellSize; // size of each creature/cell in the grid
	  this.numCritters = opts.numCritters; // the number of critters to make
		this.numSteps = opts.numSteps;
		this.step = 0;
		this.opts = opts;
		this.cb = cb; // callback function to be run when the generation is over

		// world matrix keeps track of what's in each cell
		this.worldMatrix = (() => {
			let cols = Math.round(this.canvas.width / this.cellSize);
			let rows = Math.round(this.canvas.height / this.cellSize);
			// return Array(rows).fill(Array(cols).fill(null)); // <-- this doesn't appear to work, since every row is just a reference to the same row
			let matrix = [];
			for (let r=0; r<rows; r++) {
				let row = [];
				for (let c=0; c<cols; c++) {
					row.push(null);
				}
				matrix.push(row);
			}
			return matrix;
		})();

		// the master array of all critters in the simulation
		if (Array.isArray(critters)) {
			this.critters = critters;

			// in the case that we were passed an already-created array of critters,
			// (as may happen when doing step-wise generations rather than continuous ones,
			// wherein the game does reproduction in a big chunk all at once and then creates
			// a new Simulator for the following generation (which is us))
			// we need to bind each one to the new worldMatrix created by this Simulator
			// and update it with their positions
			this.critters.map((c) => {
				// if (this.worldMatrix[c.position.y][c.position.x] === null) {
					this.worldMatrix[c.position.y][c.position.x] = c;
				// } else {
				// 	// we'll need to give the critter a new position here, in some fashion
				// }
				c.worldMatrix = this.worldMatrix;
			});
		} else {
			this.critters = [];
		}
	}

	// ******** Control methods ******** //

	// getter for the _paused property
	get paused () { return this._paused }

	// setter for the _delay property
	set delay (delay) {
		this._delay = delay;
		if (!this._paused) {
			this.startInterval();
		}
	}

	// getter for the _delay property
	get delay () { return this._delay; }

	// // getter for the number of critters
	// get numCritters () { return this.critters.length; }

	// play the simulation
	startInterval() {
		clearInterval(this._interval);
		var that = this;
		this._interval = setInterval(() => {runStep.call(that)},this._delay); // call runStep every this._delay milliseconds
		this._displayValues();
		this._paused = false;
	}

	// toggle play/pause
	togglePause() {
		// let el = document.getElementById('genome');

		if (this._paused) {
			this.startInterval(); // play
			// el.innerHTML = '';
		} else {
			clearInterval(this._interval); // pause
			this._paused = true;

			// display genome of a critter
			// el.innerHTML = JSON.stringify(this.critters[0].genome);
			// console.log(this.critters[0].genome);
		}
	}

	pause() {
		if (!this._paused) this.togglePause();
	}

	slower() {
		if (this._delay < this._maxDelay) {
			this._delay *= 2;
		}
		if (this._delay == 0) { // if the delay is 0, set delay to min delay
			this._delay = this._minDelay;
		}
		// if currently playing, we'll need to reset the interval with the new delay value
		if (!this._paused) this.startInterval();
		this._displayValues();
	}

	faster() {
		if (this._delay > this._minDelay) {
			this._delay /= 2;
		} else {
			this._delay = 0; // after that we just set the delay to 0
		}
		// if currently playing, we'll need to reset the interval with the new delay value
		if (!this._paused) this.startInterval();
		this._displayValues();
	}

	defaultSpeed() {
		this._delay = this._defaultDelay;
		// if currently playing, we'll need to reset the interval with the new delay value
		if (!this._paused) this.startInterval();
		this._displayValues();
	}

	// when a critter is clicked on, display a diagram of the critter's genome/brain
	click(pos) {
		this.pause();

		console.log(`x: ${pos.x}, y:${pos.y}`);

		// normalize the position to the center of the nearest cell
		pos.x = Math.floor(pos.x / this.cellSize);// * this.cellSize + (this.cellSize/2);
		pos.y = Math.floor(pos.y / this.cellSize);// * this.cellSize + (this.cellSize/2);

		console.log(`x: ${pos.x}, y:${pos.y}`);

		// // find which critter, if any, has been clicked on
		// for (let critter of this.critters) {
		// 	if (critter.position.x === pos.x && critter.position.y === pos.y) {
		// 		// call that critter's diagram method
		// 		critter.showInspector();
		// 		// dim the other critters
		// 		for (let c of this.critters) {
		// 			if (c.position.x !== critter.position.x && c.position.y !== critter.position.y) {
		// 				c.dim();
		// 			}
		// 		}
		//
		// 		return;
		// 	}
		// }

		let thing = this.worldMatrix[pos.y][pos.x];
		console.log(thing);
		if (thing instanceof Critter) {
			thing.showInspector();
		} else {
			console.log('no critter here!');
		}
	}

	_displayValues() {
		var speed = this._delay != 0 ? (this._defaultDelay || (this._minDelay/2)) / this._delay + 'x' : 'MAX';
		document.getElementById('speed').innerHTML = 'Speed: ' + speed + ' (' + this._delay + 'ms delay)';
		document.getElementById('numCritters').innerHTML = ' Critters: ' + this.numCritters;
	}


	// ******** Other methods ******** //

	// todo: probably move this to game.js
	populateInitial() {
		// create critter population
		for (let i=0; i<this.numCritters; i++) {
			// create new critter; if we don't pass a genome or position in a params object, the critter will be created with a random one of each
			let critter = new Thinker(this.canvas, this.worldMatrix, this.opts);
			critter.draw();
			this.critters.push(critter);
		}

		// draw initial position of all the bodies
		// for (var i=0; i<this.critters.length; i++) {
		// 	this.critters[i].draw();
		// }
	}

	stopSim() {
		clearInterval(this._interval);
		this.cb();
	}

	clearWorldMatrix() {
		for (let row=0; row<this.worldMatrix.length; row++) {
			this.worldMatrix[row].fill(null);
		}
	}

}

// -------- Game Logic -------- //

// main game loop
// the value of 'this' is bound to the 'game' object
function runStep() {
	// console.log('Run, Runner!');
	// we're using the 'time' object to record the time at various points within a given step
	// for testing purposes, to figure out which things we need to try to optimize
	// var time = {	'start' : 0,
	// 				'points' : {},
	// 				'init': function() { // set the time to 'now' when called
	// 					this.start = Date.now();
	// 				},
	// 				'addPoint' : function(name) { // add a data point
	// 					if (!this.points[name]) { // if a data point by this name doesn't already exist, create the function
	// 						this.points[name] = (function() {
	// 							var value = 0; // the private variable that will hold the running average
	// 							var count = 0; // the number of times this data point has been set
	// 							function _addPoint(now) {
	// 								value = (value * count + (now - time.start)) / (count + 1); // average this time value with all previous values
	// 								count++; // increment the number of times this data point (this.points[name]) has been set
	// 							}
	//
	// 							return {
	// 								add : function() { // add a data point to this.points[name]
	// 									_addPoint(Date.now());
	// 								},
	// 								value : function() { // return the average value
	// 									return value;
	// 								},
	// 								count : function() { // return the number of times this data point has been set
	// 									return count;
	// 								}
	// 							};
	// 						})();
	// 					}
	// 					this.points[name].add(); // add new time value to this data point
	// 				},
	// 				'getPoints' : function() { // return all data points
	// 					var results = {};
	// 					var keys = Object.keys(this.points);
	// 					for (var i=0; i < keys.length; i++) {
	// 						var key = keys[i];
	// 						var value = Math.round(this.points[key].value() * 1000000000) / 1000; // multiply by a million (to display in nano seconds) and round to 3 decimal places
	// 						var count = this.points[key].count();
	// 						results[key] = 'avgTime: ' + value + 'ns, count: ' + count;
	// 					}
	// 					return results;
	// 				},
	// 				'displayPoints' : function() { // convert data points to string and return
	// 					return JSON.stringify(this.getPoints());
	// 				}
	// 			};

	if (this.step >= this.numSteps) {
		this.stopSim();
		return;
	}

	// calculates step for each critter
	for (var i=0, len=this.critters.length; i<len; i++) {
		var critter = this.critters[i];

		if (typeof critter !== undefined) {
			critter.move();
		}
	}

	this.step++;
	// console.log(this.step);

//	console.log(time.displayPoints());
}
