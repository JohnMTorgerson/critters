// -------- Critter class -------- //

export default class Critter {
	constructor(canvas, worldMatrix, gameOpts, params) {
		this.worldMatrix = worldMatrix;
		if (typeof params === "undefined") params = {};
		this.canvas = canvas;
    this.cellSize = gameOpts.cellSize;
		this.worldWidth = gameOpts.worldWidth;
		this.worldHeight = gameOpts.worldHeight;
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
			// if genome is not passed, create a blank object
			this.genome = {};
		}
	}

	// method to move the critter's position
	// and update the canvas with the new position
	move() {
	}

	// reproduction method,
	// should return an offspring critter
	fuck() {
	}

	showInspector() {
		// console.log('diagram!');
		let inspectorHook = document.getElementById("inspector");

		// return element
		return inspectorHook;
	}

	draw(color) {
    // console.log('drawing!');
		this.context.beginPath();
		this.context.arc(this.cellSize * (this.position.x + 0.5), this.cellSize * (this.position.y + 0.5), this.cellSize / 2, 0, 2 * Math.PI, false);
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

	dim() {
		// figure out a way to dim the critter
		// (will probably have to implement a persisten color property for the critter using rgba)
	}

	erase({x,y}) {
		x = this.cellSize * (x + 0.5);
		y = this.cellSize * (y + 0.5);

    // this.draw('white');
    let r = this.cellSize / 2; // 'r' for radius of the circle
    this.context.clearRect(x - r, y - r, r * 2, r * 2);

    // this.context.beginPath();
    // this.context.rect(x - r, y - r, r * 2, r * 2);
    // this.context.stroke();
	}

	// -------- private utility functions -------- //

	_randomPosition(canvas, context, cellSize) {
		// random position
		let x;
		let y;
		do {
			x = Math.floor(Math.random() * canvas.width / cellSize) * cellSize + (cellSize/2);
			y = Math.floor(Math.random() * canvas.height / cellSize) * cellSize + (cellSize/2);
		} while (context.getImageData(x, y, 1, 1).data[3] !== 0);
		// } while (this.worldMatrix[y][x] !== null);

		// return {x:x,y:y};
		return {x: (x/cellSize - 0.5), y: (y/cellSize - 0.5)};
	}
}
