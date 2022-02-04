// -------- Bouncer class -------- //
import Critter from './Critter.js'

export default class Bouncer extends Critter {
	constructor(canvas, gameOpts, params) {
		super(canvas, gameOpts, params)
	}

	// method to move the critter's position
	// and update the canvas with the new position
	move() {
		this.erase(this.position);

		// let heaviestWeight = -1;
		// let action = 0;
    let choices = [0];
		for(let i=0; i<Object.keys(this.genome).length; i++) {
			let gene = this.genome[i];

			// if we're on the first gene, treat that as *always* activated,
			// because it's not a sensory input, but an internal impulse to move;
			// for the rest, if the input sensor controlled by this gene is activated
			// (meaning that there is something in the way in that direction),
			// then test whether that gene's action outweighs the others
			if (i == 0 || this.sense(i)) {
				// if (gene.weight > heaviestWeight) {
				// 	heaviestWeight = gene.weight;
				// 	action = gene.action;
				// }

        // add this gene's action to the choices array
        // a number of times corresponding to its weight^2 * 100
        choices = choices.concat(Array.from(Array(Math.floor(Math.pow(gene.weight,2) * 100)), () => gene.action));
      }
		}
    // randomly choose from weighted list of actions
    let action = choices[Math.floor(Math.random() * choices.length)];


    let move = this._getTranslation(action);
    let newX = this.position.x + move.x;
    let newY = this.position.y + move.y;

    if (!this.sense(action) && newX > 0 && newX < this.canvas.width && newY > 0 && newY < this.canvas.height) {
      this.position.x = newX;
      this.position.y = newY;
    }

		// then draw the critter
		this.draw();
	}

	sense(direction) {
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

	// reproduction method,
	// takes another critter to mate with as an argument
	// returns an offspring critter with mixed, mutated genome
	fuck(spouse) {
		let genome = this._emptyGenome();
		let rand = () => Math.floor(Math.random() * 2); // coin flip (0 or 1)

		for (let i=0; i<=8; i++) {
			// -- parent recombination
			let parentGenome = rand() == 0 ? this.genome : spouse.genome;
			genome[i.toString()].action = parentGenome[i.toString()].action;
			genome[i.toString()].weight = parentGenome[i.toString()].weight;

			// -- mutation
			// first, mutate the weight a tiny bit
			genome[i.toString()].weight += 2 * (rand() - 0.5) * this.gameOpts.weightMutationAmount;
			genome[i.toString()].weight = Math.min(1, genome[i.toString()].weight);
			genome[i.toString()].weight = Math.max(0, genome[i.toString()].weight);
			// then, mutate the action (if chance dictates, per the mutation rate)
			if (Math.floor(Math.random() / this.params.actionMutationRate) == 0) {
				// if we're here, then we mutate the action to a random value
				genome[i.toString()].action = Math.floor(Math.random() * 9);
			}
		}

		return new Bouncer(this.canvas, this.gameOpts, {
			genome : genome
		});
	}


	// -------- private utility functions -------- //

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

	// create a random genome
	_emptyGenome() {
	  return {
	  	0: {
				action: null,
				weight: null
	  	},
	  	1: {
				action: null,
				weight: null
	  	},
	  	2: {
				action: null,
				weight: null
	  	},
	  	3: {
				action: null,
				weight: null
	  	},
	  	4: {
				action: null,
				weight: null
	  	},
	  	5: {
				action: null,
				weight: null
	  	},
	  	6: {
				action: null,
				weight: null
	  	},
	  	7: {
				action: null,
				weight: null
	  	},
	  	8: {
				action: null,
				weight: null
	  	},
	    color: 'red'
	  }
	}

	// create a random genome
	_randomGenome() {
		let genome = this._emptyGenome();

	  let zeroThruEight = () => Math.floor(Math.random() * 9);

		for (let i=0; i<=8; i++) {
			genome[i.toString()].action = zeroThruEight();
			genome[i.toString()].weight = Math.random();
		}
		genome['0'].action = [zeroThruEight(),zeroThruEight(),0][Math.floor(Math.random()*3)];

		// // random color
		// var r = Math.round(255 * Math.random());
		// var g = Math.round(255 * Math.random());
		// var b = Math.round(255 * Math.random());
		// var color = 'rgba(' + r + ',' + g + ',' + b + ',1)';

		// console.log(genome);

		return genome;

	  // return {
	  // 	0: {
		// 		action: [zeroThruEight(),zeroThruEight(),0][Math.floor(Math.random()*3)],
		// 		weight: Math.random()
	  // 	},
	  // 	1: {
		// 		action: zeroThruEight(),
		// 		weight: Math.random()
	  // 	},
	  // 	2: {
	  // 		action: zeroThruEight(),
	  // 		weight: Math.random()
	  // 	},
	  // 	3: {
	  // 		action: zeroThruEight(),
	  // 		weight: Math.random()
	  // 	},
	  // 	4: {
	  // 		action: zeroThruEight(),
	  // 		weight: Math.random()
	  // 	},
	  // 	5: {
	  // 		action: zeroThruEight(),
	  // 		weight: Math.random()
	  // 	},
	  // 	6: {
	  // 		action: zeroThruEight(),
	  // 		weight: Math.random()
	  // 	},
	  // 	7: {
	  // 		action: zeroThruEight(),
	  // 		weight: Math.random()
	  // 	},
	  // 	8: {
	  // 		action: zeroThruEight(),
	  // 		weight: Math.random()
	  // 	},
	  //   color: 'red'
	  // }
	}

	// -------- example genome -------- //
	// genome = {
	// 	0: {
	// 			action: 7,
	// 			weight: 0.0028
	// 	},
	// 	1: {
	// 			action: 3,
	// 			weight: 0.328
	// 	},
	// 	2: {
	// 		action: 7,
	// 		weight: 0.15
	// 	},
	// 	3: {
	// 		action: 1,
	// 		weight: 0.862
	// 	},
	// 	4: {
	// 		action: 0,
	// 		weight: 0.62
	// 	},
	// 	5: {
	// 		action: 0,
	// 		weight: 0.3543
	// 	},
	// 	6: {
	// 		action: 0,
	// 		weight: 0.2
	// 	},
	// 	7: {
	// 		action: 8,
	// 		weight: 0.0
	// 	},
	// 	8: {
	// 		action: 2,
	// 		weight: 0.43
	// 	},
	//   color: 'red'
	// }
}
