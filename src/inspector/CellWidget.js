// UI used by the MindReader in the inspector,
// a widget for the user to click on cells near the critter being inspected,
// to see where it would move if other critters occupied those cells

export default class CellWidget {
	constructor(parentElement, critter) {
		// create new canvas to display diagram
		let canvas = document.createElement("canvas");
		canvas.width = 500;
		canvas.height = 500;
		parentElement.appendChild(canvas);

    this.canvas = canvas;
		this.context = this.canvas.getContext("2d");
    this.critter = critter;
    this.cellSize = this.canvas.width / 3;
		this.grid = Array.from({length:3},() => [false,false,false]);
		// this.grid = Array(3).fill([false,false,false]); // to keep track of which cells the user has activated
		console.log(this.grid);

    this.canvas.addEventListener("click", (e) => {this.click(e)}, false);

		this.draw();
  }

  click(e) {
    let rect = e.currentTarget.getBoundingClientRect();
    let coords = {x:e.clientX - rect.left, y:e.clientY - rect.top};
		let row = Math.floor(coords.y / this.cellSize);
		let col = Math.floor(coords.x / this.cellSize);
		// console.log(`row: ${row}, col: ${col}`);

		// if the click was not on the center square, record the click
		if (row !== 1 || col !== 1) {
			this.grid[row][col] = !this.grid[row][col];
		}
    // console.log(this.grid);

		// here we need to ask the critter what it would do in the scenario created by the user;
		// it should tell us which square it would move to (or which squares and with what probability)
		// which we'll need to pass on to the draw function, so that it can indicate that info to the user

		this.draw();
  }

	draw() {
		this.clear();

		for (let row=0; row<this.grid.length; row++) {
			for (let col=0; col<this.grid[row].length; col++) {
				let color = 'rgba(255,255,255,0.05)'; // for empty cells
				if (this.grid[row][col]) {
					color = 'red'; // for filled cells
				}
				this.context.beginPath();
				this.context.arc(this.cellSize * (col + 0.5),  this.cellSize * (row + 0.5), this.cellSize / 2, 0, 2 * Math.PI, false);
				this.context.closePath();
				this.context.fillStyle = color;
				this.context.fill();
			}
		}

		// draw center cell representing the critter we're testing
		this.context.beginPath();
		this.context.arc(this.cellSize * 1.5, this.cellSize * 1.5, this.cellSize / 2, 0, 2 * Math.PI, false);
		this.context.closePath();
		this.context.fillStyle = 'black';
		this.context.fill();
	}

	clear() {
		// clear canvas
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}
