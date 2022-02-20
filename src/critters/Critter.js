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

		// add the position to the worldMatrix
		this.updatePosition();
	}

	// method to move the critter's position
	// and update the canvas/worldMatrix with the new position
	move(oldPos,newPos) {
		// update internal position object
		this.position = {...newPos};

		// update position in worldMatrix
		this.deletePosition(oldPos);
		this.updatePosition();

		// update position on canvas
		this.erase(oldPos);
		this.draw();
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

	deletePosition(pos) {
		this.worldMatrix[pos.y][pos.x] = null;
	}

	updatePosition() {
		this.worldMatrix[this.position.y][this.position.x] = this;
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

	// sense whether something is in a cell
	// given by a set of coordinates relative to the critter's position
	// return the object in that cell or null if it is empty
	_sense({x,y}) {
		x += this.position.x;
		y += this.position.y;

		// if out of bounds, return 1
		if (x<0 || x>=this.worldWidth || y<0 || y>=this.worldHeight) return 1;

		// console.log(`x:${x}, y:${y}`);

		// otherwise return contents of that cell (will be null if empty)
		return this.worldMatrix[y][x];
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
			y--; //-= this.cellSize;
		} else if (down.includes(action)) {
			y++; //+= this.cellSize;
		}

		let left = [6,7,8];
		let right = [2,3,4];
		if (left.includes(action)) {
			x--;// -= this.cellSize;
		} else if (right.includes(action)) {
			x++// += this.cellSize;
		}

		return {x:x,y:y};
	}

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
