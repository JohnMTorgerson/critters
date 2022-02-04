// -------- Thinker class -------- //
import Critter from './Critter.js'

export default class Thinker extends Critter {
	constructor(canvas, gameOpts, params) {
		super(canvas, gameOpts, params)
	}

	// method to move the critter's position
	// and update the canvas with the new position
	move() {
		this.erase(this.position);

		// // let heaviestWeight = -1;
		// // let action = 0;
    // let choices = [0];
		// for(let i=0; i<Object.keys(this.genome).length; i++) {
		// 	let gene = this.genome[i];
		//
		// 	// if we're on the first gene, treat that as *always* activated,
		// 	// because it's not a sensory input, but an internal impulse to move;
		// 	// for the rest, if the input sensor controlled by this gene is activated
		// 	// (meaning that there is something in the way in that direction),
		// 	// then test whether that gene's action outweighs the others
		// 	if (i == 0 || this._sense(i)) {
		// 		// if (gene.weight > heaviestWeight) {
		// 		// 	heaviestWeight = gene.weight;
		// 		// 	action = gene.action;
		// 		// }
		//
    //     // add this gene's action to the choices array
    //     // a number of times corresponding to its weight^2 * 100
    //     choices = choices.concat(Array.from(Array(Math.floor(Math.pow(gene.weight,2) * 100)), () => gene.action));
    //   }
		// }
    // // randomly choose from weighted list of actions
    // let action = choices[Math.floor(Math.random() * choices.length)];
		//
		//
    // let move = this._getTranslation(action);
    // let newX = this.position.x + move.x;
    // let newY = this.position.y + move.y;
		//
    // if (!this._sense(action) && newX > 0 && newX < this.canvas.width && newY > 0 && newY < this.canvas.height) {
    //   this.position.x = newX;
    //   this.position.y = newY;
    // }

		// then draw the critter
		this.draw();
	}

	// reproduction method,
	// takes another critter to mate with as an argument
	// returns an offspring critter with mixed, mutated genome
	fuck(spouse) {
		let genome = this._emptyGenome();
		let rand = () => Math.floor(Math.random() * 2); // coin flip (0 or 1)

		// for (let i=0; i<=8; i++) {
		// 	// -- parent recombination
		// 	let parentGenome = rand() == 0 ? this.genome : spouse.genome;
		// 	genome[i.toString()].action = parentGenome[i.toString()].action;
		// 	genome[i.toString()].weight = parentGenome[i.toString()].weight;
		//
		// 	// -- mutation
		// 	// first, mutate the weight a tiny bit
		// 	genome[i.toString()].weight += 2 * (rand() - 0.5) * this.gameOpts.weightMutationAmount;
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

	_sense(direction) {
		if (typeof direction === 'string') return false;

		// find the center pixel in the cell to test
		let translation = this._getTranslation(direction);
		let x = this.position.x + translation.x;
		let y = this.position.y + translation.y;

		// if the pixel is out of bounds, return true
		if (x<0 || x>this.canvas.width || y<0 || y>this.canvas.height) {
			return true;
		}

		// check if the pixel is not transparent, and if it isn't, return true
		let pixelData = this.context.getImageData(x, y, 1, 1).data;
		return pixelData[3] !== 0;
	}

	// create an empty genome
	_emptyGenome() {

	}

	// create a random genome
	_randomGenome() {
		let genome = this._emptyGenome();


		// // random color
		// var r = Math.round(255 * Math.random());
		// var g = Math.round(255 * Math.random());
		// var b = Math.round(255 * Math.random());
		// var color = 'rgba(' + r + ',' + g + ',' + b + ',1)';

		// console.log(genome);

		return genome;
	}
}
