// -------- Thinker class -------- //
import Critter from './Critter.js'
import NeuralNet from './helpers/NeuralNet.js';
import MindReader from '../inspector/MindReader.js';

export default class Thinker extends Critter {
	constructor(canvas, worldMatrix, gameOpts, params) {
		super(canvas, worldMatrix, gameOpts, params)

		// if we weren't given a genome, create a random one
		if (typeof this.genome === "undefined" || Object.keys(this.genome).length === 0) {
			this.genome = this._randomGenome();
		}

		this.brain = this.genome.brain;

	}

	// method to move the critter's position
	// and update the canvas with the new position
	move() {
		// get sensory data
		let senses = this.senseAll();

		// run neural network; will return the index of the winning output neuron
		// currently, we're setting that up to correspond to an 'action',
		// as used in the Bouncer class;
		let action = this.brain.think(senses) + 1; // should be an integer 0-8, or null if no output neuron was chosen
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
	}

	senseAll() {
		// gather the sensory input
		let senses = [];
		for (let i=0; i<this.genome.sensoryNeurons.length; i++) {
			// since this._sense returns the whole critter if it finds one,
			// or any information stored by any other object in the worldMatrix,
			// we could use that information to sense different properties of those things, in principle;
			// for now, though, we just return a 1 if anything is there (0 if not)
			senses.push(this._sense(this.genome.sensoryNeurons[i]) !== null ? 1 : 0);
		}
		// add updated, normalized x and y positions of the critter, and the constant
		let x, y;
		if (this.genome.internalParams.x) x = this.position.x / this.worldWidth * 2 - 1;
		if (this.genome.internalParams.y) y = this.position.y / this.worldHeight * 2 - 1;
		senses = senses.concat([this.genome.internalParams.constant,x,y]);
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
		let coinflip = () => Math.floor(Math.random() * 2); // coin flip (0 or 1)

		// recombination of neural network
		childGenome.brain.network = childGenome.brain.network.map((layer, indexL) => {
			layer.weights = layer.weights.map((neuron, indexN) => {
				let parent = coinflip() === 0 ? this.brain : spouse.brain;
				return parent.network[indexL].weights[indexN].map((weight) => {
					// set to a completely random value every so often per the mutation rate
					if (Math.random() < this.gameOpts.actionMutationRate) {
						return Math.random() * 2 - 1;
					}
					// the rest of the time, adjust the weight up or down by a tiny amount
					return Math.min(Math.max(weight * (1 + this.gameOpts.weightMutationAmount * (2 * coinflip() - 1)),-1),1);
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
			return layer;
		});

		// recombination of internal params
		Object.keys(childGenome.internalParams).map((key, index) => {
			let value = coinflip() === 0 ? this.genome.internalParams[key] : spouse.genome.internalParams[key];
			childGenome.internalParams[key] = value;
		});

		// console.log('self, spouse, offspring:');
		// console.log(this.brain.network);
		// console.log(spouse.brain.network);
		// console.log(childGenome.brain.network);

		return new Thinker(this.canvas, this.worldMatrix, this.gameOpts, {
			genome : childGenome
		});
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
			sensoryNeurons: [],
			internalParams: {}
		};
	}

	// create a random genome
	_randomGenome() {
		let genome = this._emptyGenome();

		// first, set some parameters for the genome;
		let radius = typeof this.params.sensoryRadius !== "undefined" ? this.params.sensoryRadius : 1; // how many cells out the critter can sense;
		let hiddenNeurons = typeof this.params.hiddenNeurons !== "undefined" ? this.params.hiddenNeurons : 5; // number of hidden neurons
		let numHiddenLayers = typeof this.params.numHiddenLayers !== "undefined" ? this.params.numHiddenLayers : 1; // number of hidden layers
		let senseX = typeof this.params.senseX !== "undefined" ? this.params.senseX : true; // whether the critter can sense its absolute x position or not (boolean)
		let senseY = typeof this.params.senseY !== "undefined" ? this.params.senseY : true; // whether the critter can sense its absolute y position or not (boolean)

		// sensory neurons will contain a list of cells to sense
		// each designated by an x and y coordinate relative to the critter's position
		// which represent the number of cells (not pixels) in those directions
		for (let y=0-radius; y<=radius; y++) {
			for (let x=0-radius; x<=radius; x++) {
				if (Math.round(Math.sqrt(Math.pow(x,2) + Math.pow(y,2))) <= radius) {
					if (x!==0 || y!==0) genome.sensoryNeurons.push({x:x,y:y});
				}
			}
		}
		// console.log(genome.sensoryNeurons);

		genome.internalParams = {
			constant: 1,
			x: senseX,
			y: senseY
		};
		// genome.internalParams.push(Math.random()); // a random constant to motivate movement in the absence of sensory input
		//genome.internalParams.push(...); // in the future we could implement some kind of oscillator here, perhaps

		// currently we only use 8 sensory neurons, one for each adjacent cell (true or false, depending on if it is occupied)
		// in the future, we could implement distance vision and color sensing,
		// as potential examples of more sophisticated sensory input
		genome.brain = new NeuralNet({
				inputNeurons: genome.sensoryNeurons.length + Object.keys(genome.internalParams).length, // the first group are for sensing, the rest determined by the genome's internal params
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
}
