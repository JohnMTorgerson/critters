// -------- Thinker class -------- //
import Critter from './Critter.js'
import NeuralNet from './helpers/NeuralNet.js';
import MindReader from '../inspector/MindReader.js';
const _ = require('lodash');

export default class Thinker extends Critter {
	constructor(canvas, worldMatrix, gameOpts, params) {
		super(canvas, worldMatrix, gameOpts, params)

		this.angularRes = this.params.angularRes || 8; // angular resolution of sensory information

		// if we weren't given a genome, create a random one
		if (typeof this.genome === "undefined" || Object.keys(this.genome).length === 0) {
			this.genome = this._randomGenome();
		} else {
			// this just makes sure the genome is 'live',
			// i.e. that its brain is a live instance of NeuralNet
			// (which isn't the case when resurrecting a critter from a saved sim)
			this.genome = this._givenGenome(this.genome);
		}

		// this.brain = this.genome.brain;

	}

	// method to move the critter's position
	// and update the canvas with the new position
	move() {
		// get sensory data
		let senses = this.senseAll();

		// run neural network; will return the index of the winning output neuron
		// currently, we're setting that up to correspond to an 'action',
		// as used in the Bouncer class;
		let action = this.genome.brain.think(senses) + 1; // should be an integer 0-8, or null if no output neuron was chosen
		if (action == null) action = 0; // if no output neuron was chosen, we'll just stay in place
		// console.log('winning move direction: ' + action);
		let move = this._getTranslation(action);

		// add the move to current position
		let newPosition = {
			x: this.position.x + move.x,
	    y: this.position.y + move.y
		}

		// console.log(`newX: ${newX}, newY:${newY}`);

		// update position only if the space is free and in bounds
    if (!this._sense({x:move.x,y:move.y})) {// && newX >= 0 && newX < this.worldWidth && newY >= 0 && newY < this.worldHeight) {
			// call the move method from the Critter class,
			// which will do all the erasing and drawing on the canvas
			// and update the worldMatrix
			// and update this.position
			super.move(this.position,newPosition);
    }

		// we're returning the move object just so that when a child class
		// calls this method, they can get the information about the move
		return move;
	}

	senseAll() {
		// throw error if numSensorTypes is not 1,
		// since a baseline Thinker can only accept 1;
		// to use more than one, extend the class, and store that number of values
		// per loop through the sensoryNeurons (the idea being to detect different kinds of objects)
		// so that the number of senses matches the number of input neurons (which is controlled by numSensorTypes)
		if (typeof this.params.numSensorTypes !== "undefined" && this.params.numSensorTypes !== 1) {
			throw Error("A baseline Thinker can only accept 1 sensor type; please set params.numSensorTypes to 1 or do not pass a value");
		}

		// gather the sensory input
		let senses = [];
		for (let i=0; i<this.genome.sensoryNeurons.length; i++) {
			// since this._sense returns the whole critter if it finds one,
			// or any information stored by any other object in the worldMatrix,
			// we could use that information to sense different properties of those things, in principle;
			// for now, though, we just return a 1 if anything is there (0 if not)
			let thing = this._sense(this.genome.sensoryNeurons[i]);
			senses.push(thing !== null ? 1 : 0);
		}
		// add updated, normalized x and y positions of the critter, and the constant
		// (if x or y sensing is set to false, we just set the values at 0 so the neurons are never activated)
		let x = 0;
		let y = 0;
		let osc = 0;
		if (this.genome.internalParams.x) x = this.position.x / this.worldWidth * 2 - 1;
		if (this.genome.internalParams.y) y = this.position.y / this.worldHeight * 2 - 1;
		if (this.genome.internalParams.osc.on) osc = (this.stepCount % this.genome.internalParams.osc.period) / (this.genome.internalParams.osc.period - 1);
		senses = senses.concat([x,y,osc]);
		// console.log('------------------');
		// console.log(`x:${this.position.x/this.cellSize + .5}, y:${this.position.y/this.cellSize + .5}`);
		// console.log('senses: ' + senses);

		return senses;
	}

	// reproduction method,
	// takes another critter to mate with as an argument
	// returns an offspring critter with mixed, mutated genome;
	fuck(spouse) {
		let childGenome = this._randomGenome();
		let coinflip = () => (Math.floor(Math.random() * 2) * 2) - 1; // coin flip (-1 or 1)

		// recombination of neural network
		childGenome.brain.network = childGenome.brain.network.map((layer, indexL) => {

			layer.weights = layer.weights.map((neuron, indexN) => {
				let parent = coinflip() === 1 ? this.genome.brain : spouse.genome.brain;
				return parent.network[indexL].weights[indexN].map((weight) => {
					// set to a completely random value every so often per the mutation rate
					if (Math.random() < this.gameOpts.actionMutationRate) {
						return this.genome.brain.randWeight(layer.weights.length);
					}
					// the rest of the time, adjust the weight up or down by a tiny amount
					return weight + (this.gameOpts.weightMutationAmount/Math.pow(layer.weights.length,0.5) * coinflip());// * (2 * Math.random() - 1));
					// return Math.min(Math.max(weight * (1 + this.gameOpts.weightMutationAmount * coinflip()),-1),1);
				});

				// let parentMatrix = parent.network[indexL].weights;
				// parentMatrix.forEach((cell, indexC, matrix) => {
				// 	console.log(indexC + ' ' + indexN);
				// 	if (indexC[0] === indexN) {
				// 		console.log('setting!');
				// 		childGenome.brain.setWeight(indexL,indexC,parent.getWeight(indexL,indexC));
				// 	}
				// });
			});

			layer.biases = layer.biases.map((bias,indexB) => {
				if (indexL === 0) return 0; // input layer doesn't have biases

				// set to a completely random value every so often per the mutation rate
				if (Math.random() < this.gameOpts.actionMutationRate) {
					return this.genome.brain.randBias();
				}

				let parent = coinflip() === 1 ? this.genome.brain : spouse.genome.brain;
				bias = parent.network[indexL].biases[indexB];

				// the rest of the time, adjust the weight up or down by a tiny amount
				return bias + (this.gameOpts.biasMutationAmount * Math.random() * coinflip());
			});

			return layer;
		});

		// recombination of internal params
		Object.keys(childGenome.internalParams).map((key, index) => {
			let value = coinflip() === 0 ? this.genome.internalParams[key] : spouse.genome.internalParams[key];
			childGenome.internalParams[key] = value;
		});

		// console.log('self, spouse, offspring:');
		// console.log(this.genome.brain.network);
		// console.log(spouse.genome.brain.network);
		// console.log(childGenome.brain.network);

		let childParams = {...this.params};
		childParams.genome = childGenome;

		return this._birth(childParams);
	}

	// we separate this step into its own method so that each child class can return its own type
	_birth(params) {
		return new Thinker(this.canvas, this.worldMatrix, this.gameOpts, params);
	}

	showInspector() {
		let inspectorElement = super.showInspector();

		let mindReader = new MindReader(inspectorElement, this);

		// console.log(this.worldMatrix);

	}

	// -------- private utility functions -------- //

	// // sense whether something is in a cell
	// // given by a set of coordinates relative to the critter's position
	// _sense(coords) {
	//
	// 	// find the center pixel in the cell to test
	// 	let x = (this.position.x + coords.x + 0.5) * this.cellSize;
	// 	let y = (this.position.y + coords.y + 0.5) * this.cellSize;
	//
	// 	// if the pixel is out of bounds, return 1
	// 	if (x<0 || x>this.canvas.width || y<0 || y>this.canvas.height) {
	// 		return 1;
	// 	}
	//
	// 	// check if the pixel is not transparent, and if it isn't, return 1, and if it is, 0
	// 	let pixelData = this.context.getImageData(x, y, 1, 1).data;
	// 	return pixelData[3] !== 0 ? 1 : 0;
	// }

	// create an empty genome
	_emptyGenome() {
		// a genome consists of a brain schematic (an instance of NeuralNet)
		// and a number of internal parameters;
		// the brain will consist of a number of input neurons, some of which
		// will be sensory neurons, and the rest of which will correspond
		// to a value or function contained within internalParams
		return {
			brain: null, // brain will contain an instance of a NeuralNet
			sensoryInputs: [],
			internalParams: {}
		};
	}

	// create a random genome
	_randomGenome() {
		let genome = this._emptyGenome();

		// first, set some parameters for the genome;
		let radius = typeof this.params.sensoryRadius !== "undefined" ? this.params.sensoryRadius : 1; // how many cells out the critter can sense;
		// let angularRes = typeof this.params.angularRes !== "undefined" ? this.params.angularRes : 8; // how many spatial input neurons there will be (corresponding to how many angular chunks to split the sensory circle into)
		let hiddenNeurons = typeof this.params.hiddenNeurons !== "undefined" ? this.params.hiddenNeurons : 5; // number of hidden neurons
		let numHiddenLayers = typeof this.params.numHiddenLayers !== "undefined" ? this.params.numHiddenLayers : 1; // number of hidden layers
		let senseX = typeof this.params.senseX !== "undefined" ? this.params.senseX : true; // whether the critter can sense its absolute x position or not (boolean)
		let senseY = typeof this.params.senseY !== "undefined" ? this.params.senseY : true; // whether the critter can sense its absolute y position or not (boolean)
		let oscOn = typeof this.params.oscOn === "boolean" ? this.params.oscOn : true; // whether to include an internal oscillator among the critter's inputs
		let oscPeriod = Number.isFinite(this.params.oscPeriod) ? Math.max(this.params.oscPeriod,2) : 10; // 2 is the minimum oscillator period, default is 10
		let numSensorTypes = typeof this.params.numSensorTypes !== "undefined" ? this.params.numSensorTypes : 1; // the number of different objects the critter can distinguish (e.g. can it tell the difference between an obstacle and another critter?)

		// console.log(`numSensorTypes == ${numSensorTypes}`);

		// sensory neurons will contain a list of cells to sense
		// each designated by an x and y coordinate relative to the critter's position
		// which represent the number of cells (not pixels) in those directions
		for (let y=0-radius; y<=radius; y++) {
			for (let x=0-radius; x<=radius; x++) {
				if (Math.round(Math.sqrt(Math.pow(x,2) + Math.pow(y,2))) <= radius) {
					if (x!==0 || y!==0) genome.sensoryInputs.push({x:x,y:y});
				}
			}
		}
		// console.log(genome.sensoryNeurons);

		genome.internalParams = {
			x: senseX,
			y: senseY,
			osc: {
				on: oscOn,
				period: oscPeriod
			}
		};

		genome.brain = new NeuralNet({
				inputNeurons: (this.angularRes * numSensorTypes) + Object.keys(genome.internalParams).length, // the first group are for sensing, the rest determined by the genome's internal params
				outputNeurons: 8, // 8 output neurons correspond to the 8 possible cells the critter can move to
				hiddenNeurons: hiddenNeurons,
				numHiddenLayers: numHiddenLayers
		});

		// // random color
		// var r = Math.round(255 * Math.random());
		// var g = Math.round(255 * Math.random());
		// var b = Math.round(255 * Math.random());
		// var color = 'rgba(' + r + ',' + g + ',' + b + ',1)';

		// console.log(genome);

		return genome;
	}

	// checks if genome.brain is a live instance of NeuralNet,
	// and if it isn't, makes it one;
	// this is currently not necessary when two critters fuck and create a child,
	// because the child critter's genome is created with a live NeuralNet,
	// but it is currently necessary when reviving a critter from a saved sim,
	// in which case the genome is saved as a JSON object (no NeuralNet instance)
	_givenGenome(genome) {
		if (!(genome.brain instanceof NeuralNet)) {
			// we make a new one, and in doing so, we are using the info from the critter's params,
			// not from the given genome; this is okay; if the given genome doesn't have the same features/params/dimensions
			// as the params given to this critter, then something went wrong somewhere else, because it's supposed to;
			// so we can assume they are the same here;

			// we create the new genome and then replace its network with the given one
			let tempGenome = this._randomGenome();
			tempGenome.brain.network = _.cloneDeep(genome.brain.network);
			genome = tempGenome;
		}
		return genome;
	}
}
