
// -------- Simulator class -------- //

// runs a single generation of simulation
// holds simulation state such as play/pause and speed information
// holds main array of critters
export default class Simulator {
	constructor(canvas, delay) {
		// private properties
		this._paused = true;
		this._interval; // will hold the setInterval object that runs the main step function
		this._defaultDelay = delay; // default millisecond interval delay between steps
		this._delay = this._defaultDelay; // set interval to default interval delay
		this._maxDelay = this._defaultDelay * 16; // max interval delay
		this._minDelay = this._defaultDelay / 4; // min interval delay

		// public properties
		this.canvas = canvas;
		this.context = this.canvas.getContext("2d");
		this.critters = []; // the master array of all critters in the simulation
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

	// getter for the number of critters
	get numCritters () { return this.critters.length; }

	// play the simulation
	startInterval() {
		clearInterval(this._interval);
		var that = this;
		this._interval = setInterval(function() {runStep.call(that);},this._delay); // call runStep every this.delay milliseconds
		this._paused = false;
	}

	// toggle play/pause
	togglePause() {
		if (this._paused) {
			this.startInterval(); // play
		} else {
			clearInterval(this._interval); // pause
			this._paused = true;
		}
	}

	slower() {
		if (this._delay < this._maxDelay) {
			this.delay *= 2;
		}
		if (this._delay == 0) { // if the delay is 0, set delay to min delay
			this.delay = this._minDelay;
		}
	}

	faster() {
		if (this._delay > this._minDelay) {
			this.delay /= 2;
		} else {
			this.delay = 0; // after that we just set the delay to 0
		}
	}

	defaultSpeed() {
		this.delay = this._defaultDelay;
	}

	// ******** Other methods ******** //
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

	// calculates step for each critter
	for (var i=0, len=this.critters.length; i<len; i++) {
		var critter = this.critters[i];

		if (typeof critter !== undefined) {
			critter.move();
		}
	}

//	console.log(time.displayPoints());

	var speed = this.delay != 0 ? this._defaultDelay / this.delay + 'x' : 'MAX';
	document.getElementById('speed').innerHTML = 'Speed: ' + speed;
	document.getElementById('numCritters').innerHTML = ' Critters: ' + this.numCritters;
}
