// -------- Interactor class -------- //
import Thinker from './Thinker.js';
// import NeuralNet from './helpers/NeuralNet.js';
// import MindReader from '../inspector/MindReader.js';
const math = require('mathjs');

// Interactors are simply an extension of Thinkers that can tell the difference
// betwen Obstacles, Predators, and Prey. Predators and Prey will inherit from this class
export default class Interactor extends Thinker {
	constructor(canvas, worldMatrix, gameOpts, params) {

		// sense Obstacles, boundaries, Prey, and Predators separately;
		// if we wanted to group any other objects together to sense as a leftovers group,
		// we could add 'all-else' as a final element of the array
		params.sensorTypes = ['Obstacle','boundary','Prey','Predator'];
		super(canvas, worldMatrix, gameOpts, params)

	}


	_birth(params) {
		return new Interactor(this.canvas, this.worldMatrix, this.gameOpts, params);
	}
}
