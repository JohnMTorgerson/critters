// -------- Interactor class -------- //
import Thinker from './Thinker.js';
// import NeuralNet from './helpers/NeuralNet.js';
// import MindReader from '../inspector/MindReader.js';
const math = require('mathjs');

// Interactors are simply an extension of Thinkers that can tell the difference
// betwen Obstacles, Predators, and Prey. Predators and Prey will inherit from this class
export default class Interactor extends Thinker {
	constructor(canvas, worldMatrix, gameOpts, params) {
		// force numSensorTypes to be 3, as we will detect 3 types of things
		// Obstacles/boundaries, Prey, and Predators
		params.numSensorTypes = 4;
		super(canvas, worldMatrix, gameOpts, params)

	}

	senseAll() {
		// let wedgeSize = 2 * Math.PI / this.angularRes; // the angular size of a single sensory wedge in radians

		// gather the sensory input
		let obstacleSensors = Array(this.angularRes).fill(0);
		let boundarySensors = Array(this.angularRes).fill(0);
		let preySensors = Array(this.angularRes).fill(0);
		let predatorSensors = Array(this.angularRes).fill(0);

		for (let i=0; i<this.genome.sensoryInputs.length; i++) {
			let coords = this.genome.sensoryInputs[i];
			let angle = math.atan2(0-coords.y,coords.x); // [0,pi] when y>=0, (-pi,0) when y<0
			if (angle < 0) angle = (2*Math.PI) + angle; // change -y positions to go from pi to 2pi
			let distance = math.distance([0,0],[coords.x,coords.y]);
			let magnitude = distance !== 0 ? 1/distance : 1; // distance should never be 0, but just in case
			if (magnitude > 0.707) magnitude = 1; // just a gross hack to make sure stuff immediately to the intercardinal directions is given a magnitude of 1

			// convert the angle into an array index corresponding to which angular wedge it fits into;
			// an angle of 0, for instance, is y = 0, 0 <= x < 2pi/angularRes, and proceeding counter-clockwise
			// but we want the first wedge to point directly east; so if this.angularRes is 4,
			// we adjust the wedges so that angles of 0 to pi/4 and 7pi/4 to 2pi are in wedge 0;
			// in other words, everything's just offset by half a wedge;
			// we're doing this so that with 8 divisions, for example,
			// we can correspond them to the cardinal and intercardinal directions (E,NE,N, NW, etc...);
			// this is not only helpful to visualize, but it also corresponds more neatly with where things can be in the actual grid (at least nearby things)
			let index = Math.floor((angle + (Math.PI/this.angularRes)) / (2 * Math.PI) * this.angularRes) % 8;

			// since this._sense returns the whole object it finds (if any),
			// we use that information to sense several different kinds of things;
			// so the critter can distinguish prey from walls and predators, etc.
			let thing = this._sense(coords);
			// obstacleSensors.push(thing !== null && thing.constructor.name === 'Obstacle' ? 1 : 0);
			// boundarySensors.push(this !== null && typeof thing === 'number' ? 1 : 0);
			// preySensors.push(thing !== null && thing.constructor.name === 'Prey' ? 1 : 0);
			// predatorSensors.push(thing !== null && thing.constructor.name === 'Predator' ? 1 : 0);

			// console.log(
			// 	`thing: ${thing !== null}\n`+
			// 	`coords: ${coords.x}, ${coords.y}\n`+
			// 	`angle: ${angle}\n`+
			// 	`distance: ${distance}\n`+
			// 	`magnitude: ${magnitude}\n`+
			// 	`index: ${index}`
			// );

			// now add the sensed thing to its appropriate sensory array, based on what kind of thing it is;
			// but only if its magnitude is greater than anything of the same kind already sensed in that same wedge
			if (thing !== null) {
				if (typeof thing === 'number') {
					// it's a boundary wall
					boundarySensors[index] = Math.max(boundarySensors[index],magnitude);
				} else {
					switch(thing.constructor.name) {
						case 'Obstacle':
							obstacleSensors[index] = Math.max(obstacleSensors[index],magnitude);
							break;
						case 'Prey':
							preySensors[index] = Math.max(preySensors[index],magnitude);
							break;
						case 'Predator':
							predatorSensors[index] = Math.max(predatorSensors[index],magnitude);
							break;
					}
				}
			}
		}

		// add updated, normalized x and y positions of the critter, and the oscillator
		// (if x or y sensing or oscillator is set to false, we just set the values at 0 so the neurons are never activated)
		let x = 0;
		let y = 0;
		let osc = 0;
		if (this.genome.internalParams.x) x = this.position.x / this.worldWidth * 2 - 1;
		if (this.genome.internalParams.y) y = this.position.y / this.worldHeight * 2 - 1;
		if (this.genome.internalParams.osc.on) osc = (this.stepCount % this.genome.internalParams.osc.period) / (this.genome.internalParams.osc.period - 1);
		let otherSensors = [x,y,osc];

		let senses = [...obstacleSensors, ...boundarySensors, ...preySensors, ...predatorSensors, ...otherSensors];

		return senses;
	}

	_birth(params) {
		return new Interactor(this.canvas, this.worldMatrix, this.gameOpts, params);
	}
}
