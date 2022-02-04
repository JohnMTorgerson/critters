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
			this.position = this._randomPosition(this.canvas, this.context, this.cellSize);
		}
		if (typeof params.genome === "object") {
			this.genome = params.genome;
		} else {
			// if genome is not passed, create a random one
			this.genome = this._randomGenome();
		}
	}

	// method to move the critter's position
	// and update the canvas with the new position
	move() {
	}

	// sense method, currently not called from outside the class
	sense() {
	}

	// reproduction method,
	// should return an offspring critter
	fuck() {
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

	// -------- private utility functions -------- //


	// create an empty genome
	_emptyGenome() {
	}

	// create a random genome
	_randomGenome() {
	}

	_randomPosition(canvas, context, cellSize) {
		// random position
		let x;
		let y;
		do {
			x = Math.floor(Math.random() * canvas.width / cellSize) * cellSize + (cellSize/2);
			y = Math.floor(Math.random() * canvas.height / cellSize) * cellSize + (cellSize/2);
		} while (context.getImageData(x, y, 1, 1).data[3] !== 0);

		return {x:x,y:y};
	}
}
