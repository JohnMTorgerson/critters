// -------- Interactor class -------- //
import Thinker from './Thinker.js';
// import NeuralNet from './helpers/NeuralNet.js';
// import MindReader from '../inspector/MindReader.js';

// Interactors are simply an extension of Thinkers that can tell the difference
// betwen Obstacles, Predators, and Prey. Predators and Prey will inherit from this class
export default class Interactor extends Thinker {
	constructor(canvas, worldMatrix, gameOpts, params) {
		// force numSensorTypes to be 3, as we will detect 3 types of things
		// Obstacles/boundaries, Prey, and Predators
		params.numSensorTypes = 3;
		super(canvas, worldMatrix, gameOpts, params)

	}

	senseAll() {
		// gather the sensory input
		let obstacleSensors = [];
		let preySensors = [];
		let predatorSensors = [];
		for (let i=0; i<this.genome.sensoryNeurons.length; i++) {
			// since this._sense returns the whole object it finds (if any),
			// we use that information to sense several different kinds of things;
			// so the critter can distinguish prey from walls and predators, etc.
			let thing = this._sense(this.genome.sensoryNeurons[i]);
			obstacleSensors.push((thing !== null && thing.constructor.name === 'Obstacle') || typeof thing === 'number' ? 1 : 0);
			preySensors.push(thing !== null && thing.constructor.name === 'Prey' ? 1 : 0);
			predatorSensors.push(thing !== null && thing.constructor.name === 'Predator' ? 1 : 0);
		}

		// add updated, normalized x and y positions of the critter, and the constant
		// (if x or y sensing is set to false, we just set the values at 0 so the neurons are never activated)
		let x = 0;
		let y = 0;
		if (this.genome.internalParams.x) x = this.position.x / this.worldWidth * 2 - 1;
		if (this.genome.internalParams.y) y = this.position.y / this.worldHeight * 2 - 1;
		let otherSensors = [this.genome.internalParams.constant,x,y];

		let senses = [...obstacleSensors, ...preySensors, ...predatorSensors, ...otherSensors];

		return senses;
	}
}
