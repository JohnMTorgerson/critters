// -------- Thinker class -------- //
import Critter from './Critter.js'
import NeuralNet from './NeuralNet.js';

export default class Thinker extends Critter {
	constructor(canvas, gameOpts, params) {
		super(canvas, gameOpts, params)

		// if we weren't given a genome, create a random one
		if (typeof this.genome === "undefined" || Object.keys(this.genome).length === 0) {
			this.genome = this._randomGenome();
		}

		this.brain = this.genome.brain;
	}

	// method to move the critter's position
	// and update the canvas with the new position
	move() {
		// erase current position of critter
		this.erase(this.position);

		// gather the sensory input
		let senses = [];
		for (let i=0, len=this.brain.inputNeurons - this.genome.internalParams.length; i<len; i++) {
			senses.push(this._sense(i));
		}
		senses = senses.concat(this.genome.internalParams);
		// console.log('senses: ' + senses);

		// run neural network; will return the index of the winning output neuron
		// currently, we're setting that up to correspond to an 'action',
		// as used in the Bouncer class;
		let action = this.brain.think(senses); // should be an integer 0-8, or null if no output neuron was chosen
		if (action == null) action = 0; // if no output neuron was chosen, we'll just stay in place
		// console.log('winning move direction: ' + action);
		let move = this._getTranslation(action);

		// add the move to current position
    let newX = this.position.x + move.x;
    let newY = this.position.y + move.y;

		// update position only if the space is free and in bounds
    if (!this._sense(action) && newX > 0 && newX < this.canvas.width && newY > 0 && newY < this.canvas.height) {
      this.position.x = newX;
      this.position.y = newY;
    }

		// then draw the critter
		this.draw();
	}

	// reproduction method,
	// takes another critter to mate with as an argument
	// returns an offspring critter with mixed, mutated genome
	fuck(spouse) {
		let genome = this._randomGenome();
		let coinflip = () => Math.floor(Math.random() * 2); // coin flip (0 or 1)

		// create a new NeuralNet and use the setWeight method to pick between parent connections
		// mutate those connections
		// then pick between the internalParams of each parent's genome

		// for (let i=0; i<=8; i++) {
		// 	// -- parent recombination
		// 	let parentGenome = coinflip() == 0 ? this.genome : spouse.genome;
		// 	genome[i.toString()].action = parentGenome[i.toString()].action;
		// 	genome[i.toString()].weight = parentGenome[i.toString()].weight;
		//
		// 	// -- mutation
		// 	// first, mutate the weight a tiny bit
		// 	genome[i.toString()].weight += 2 * (coinflip() - 0.5) * this.gameOpts.weightMutationAmount;
		// 	genome[i.toString()].weight = Math.min(1, genome[i.toString()].weight);
		// 	genome[i.toString()].weight = Math.max(0, genome[i.toString()].weight);
		// 	// then, mutate the action (if chance dictates, per the mutation rate)
		// 	if (Math.floor(Math.random() / this.params.actionMutationRate) == 0) {
		// 		// if we're here, then we mutate the action to a random value
		// 		genome[i.toString()].action = Math.floor(Math.random() * 9);
		// 	}
		// }

		return new Thinker(this.canvas, this.gameOpts, {
			genome : genome
		});
	}

	// -------- private utility functions -------- //

	// sense whether something is in an adjacent cell
	// (which cell being given by the 'direction' parameter, values 1-8, 1 being 12:00 or North, proceeding clockwise)
	// returns 1 if the cell is occupied (or out of bounds) and a 0 if not
	_sense(direction) {

		if (typeof direction === 'string') return false;

		// find the center pixel in the cell to test
		let translation = this._getTranslation(direction);
		let x = this.position.x + translation.x;
		let y = this.position.y + translation.y;

		// if the pixel is out of bounds, return 1
		if (x<0 || x>this.canvas.width || y<0 || y>this.canvas.height) {
			return 1;
		}

		// check if the pixel is not transparent, and if it isn't, return 1, and if it is, 0
		let pixelData = this.context.getImageData(x, y, 1, 1).data;
		return pixelData[3] !== 0 ? 1 : 0;
	}

	// given an action (an integer from 0 to 8)
	// get the corresponding number of pixels to move by
	// (e.g. 1 is up a cell, 3 is right a cell, 4 is right and down a cell)
	_getTranslation(action) {
		let x = 0;
		let y = 0;
		let up = [1,2,8];
		let down = [4,5,6];
		if (up.includes(action)) {
			y -= this.cellSize;
		} else if (down.includes(action)) {
			y += this.cellSize;
		}

		let left = [6,7,8];
		let right = [2,3,4];
		if (left.includes(action)) {
			x -= this.cellSize;
		} else if (right.includes(action)) {
			x += this.cellSize;
		}

		return {x:x,y:y};
	}

	// create an empty genome
	_emptyGenome() {
		// a genome consists of a brain schematic (an instance of NeuralNet)
		// and a number of internal parameters;
		// the brain will consist of a number of input neurons, some of which
		// will be sensory neurons, and the rest of which will correspond
		// to a value or function contained within internalParams
		return {
			brain: null, // brain will contain an instance of a NeuralNet
			internalParams: []
		};
	}

	// create a random genome
	_randomGenome() {
		let genome = this._emptyGenome();

		genome.internalParams.push(Math.random()); // a random constant to motivate movement in the absence of sensory input
		//genome.internalParams.push(...); // in the future we could implement some kind of oscillator here, perhaps

		// currently we only use 8 sensory neurons, one for each adjacent cell (true or false, depending on if it is occupied)
		// in the future, we could implement distance vision and color sensing,
		// as potential examples of more sophisticated sensory input
		genome.brain = new NeuralNet({
				inputNeurons: 8 + genome.internalParams.length, // 0-7 are for sensing, the rest determined by the genome's internal params
				outputNeurons: 8, // 8 output neurons correspond to the 8 possible cells the critter can move to
				hiddenNeurons: 10,
				numHiddenLayers: 1
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
