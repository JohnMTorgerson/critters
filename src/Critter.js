// -------- Critter class -------- //

export default class Critter {
	constructor(canvas, gameOpts, params) {
		if (typeof params === "undefined") params = {};
		this.canvas = canvas;
    this.cellSize = gameOpts.cellSize;
		this.context = this.canvas.getContext("2d");
		this.params = params;
		this.gameOpts = gameOpts;
		if (typeof params.position === "object") {
			this.position = params.position;
		} else {
			// if position is not passed, create a random one
			this.position = randomPosition(this.canvas, this.context, this.cellSize);
		}
		if (typeof params.genome === "object") {
			this.genome = params.genome;
		} else {
			// if genome is not passed, create a random one
			this.genome = randomGenome();
		}
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


    let move = this.getTranslation(action);
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
    let translation = this.getTranslation(direction);
    let x = this.position.x + translation.x;
    let y = this.position.y + translation.y;

    // check if the pixel is not transparent, and if it isn't, return true
    let pixelData = this.context.getImageData(x, y, 1, 1).data;
    return pixelData[3] !== 0;
	}

  // given an action (an integer from 0 to 8)
  // get the corresponding number of pixels to move by
  // (e.g. 1 is up a cell, 3 is right a cell, 4 is right and down a cell)
  getTranslation(action) {
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

	draw(color) {
    // console.log('drawing!');
		this.context.beginPath();
		this.context.arc(this.position.x, this.position.y, this.cellSize / 2, 0, 2 * Math.PI, false);
		this.context.closePath();
    if (typeof color === 'undefined') {
      this.context.fillStyle = this.genome.color;
    } else {
      this.context.fillStyle = color;
    }
		this.context.fill();
		// this.context.lineWidth = 0.5;
		// this.context.strokeStyle = 'black';
		// this.context.stroke();
	}

	erase({x,y}) {
    // this.draw('white');
    let r = this.cellSize / 2; // 'r' for radius of the circle
    this.context.clearRect(x - r, y - r, r * 2, r * 2);

    // this.context.beginPath();
    // this.context.rect(x - r, y - r, r * 2, r * 2);
    // this.context.stroke();
	}

	// reproduction method,
	// takes another critter to mate with as an argument
	// returns an offspring critter with mixed, mutated genome
	fuck(spouse) {
		let genome = emptyGenome();
		let rand = () => Math.floor(Math.random() * 2); // coin flip (0 or 1)

		for (let i=0; i<=8; i++) {
			// -- parent recombination
			let parentGenome = rand() == 0 ? this.genome : spouse.genome;
			genome[i.toString()].action = parentGenome[i.toString()].action;
			genome[i.toString()].weight = parentGenome[i.toString()].weight;

			// -- mutation
			// first, mutate the weight a tiny bit
			genome[i.toString()].weight += 2 * (rand() - 0.5) * this.gameOpts.weightMutationAmount;
			// then, mutate the action (if chance dictates, per the mutation rate)
			if (Math.floor(Math.random() / this.params.actionMutationRate) == 0) {
				// if we're here, then we mutate the action to a random value
				genome[i.toString()].action = Math.floor(Math.random() * 9);
			}
		}

		return genome;
	}
}

// -------- private utility functions -------- //

// create a random genome
function emptyGenome() {
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
function randomGenome() {
	let genome = emptyGenome();

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

function randomPosition(canvas, context, cellSize) {
	// random position
	let x;
	let y;
	do {
		x = Math.floor(Math.random() * canvas.width / cellSize) * cellSize + (cellSize/2);
		y = Math.floor(Math.random() * canvas.height / cellSize) * cellSize + (cellSize/2);
	} while (context.getImageData(x, y, 1, 1).data[3] !== 0);

	return {x:x,y:y};
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
