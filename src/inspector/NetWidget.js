const math = require('mathjs')

export default class NetWidget {
	constructor(parentElement, critter) {
		this.critter = critter;
		this.neuronRadius = 15;
		this.vSpacing = 100;
		this.outputText = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖"];

		// create new canvas to display diagram
		this.canvas = document.createElement("canvas");
		this.canvas.width = 500;
		this.canvas.height = 700;
		parentElement.appendChild(this.canvas);
		this.context = this.canvas.getContext("2d");

		this.canvas.addEventListener("click", (e) => {this.click(e)}, false);

		// update inputs to current position;
		// when the simulation is paused, we need to manually
		// sense the next step to see where the next move will be
		this.critter.genome.brain.think(this.critter.senseAll());

		// create diagram for each neuron, which will contain
		// that neuron's x and y coordinates and size on the canvas
		// (as well as its value and weights)
		this.diagram = [];
    for (let i=0; i<this.critter.genome.brain.network.length; i++) {
      let networkLayer = this.critter.genome.brain.network[i];
      let layerLength = networkLayer.weights.length;
			let spacing = this.canvas.width/(layerLength+1);
      let neurY = this.vSpacing * (i+1);
			let finalLayer = i === this.critter.genome.brain.network.length-1; // boolean for if this is the final (output) layer

			let diagramLayer = [];
			networkLayer.values.map((value, index) => {
				index = index[0];
        let neurX = spacing * (index+1);
				let weights = networkLayer.weights[index]; // get this neuron's weights

				let diagramNeuron = {
					layer: i,
					index: index,
					x: neurX,
					y: neurY,
					r: this.neuronRadius,
					hovered: false,
					clicked: false,
					value: value,
					weights: weights
				};

				if (finalLayer) {
					diagramNeuron.text = this.outputText[index];
					diagramNeuron.outputNeuron = true;
				}

				// just for a special case where the inputs correspond to the following text,
				// we add that text to those neurons
				if (i === 0 && layerLength === 11) {
					let inputKey = ["↖", "↑", "↗", "←", "→", "↙", "↓", "↘", "X", "Y", "osc"];
					diagramNeuron.text = inputKey[index];
				}

				diagramLayer.push(diagramNeuron);
			});

			this.diagram.push(diagramLayer);
    }

		console.log(this.diagram)

		this.draw();
  }

	draw() {
		this.clear();

		// loop through each layer of the diagram
		for (let l=0; l<this.diagram.length; l++) {
			let layer = this.diagram[l];

			// loop through each neuron of this layer
			for (let neuron of layer) {
				let rgb = this.color(Math.pow(neuron.value,1));
				let fillColor = this.colorString(rgb);
				let strokeColor = 'rgba(0,0,0,0)';

				let textColor = rgb.r + rgb.g + rgb.b > 100 ? '#111111' : '#CCCCCC';

				// if this neuron is clicked on
				if (!neuron.outputNeuron && neuron.clicked) {
					// put a stroke around the neuron
					strokeColor = 'rgba(0,0,0,0.35)';

					// display lines for weights from this neuron to next layer;
					// loop through this neuron's weights
					for (let w=0; w<neuron.weights.length; w++) {
						let weight = neuron.weights[w];
						// let normWeight = Math.pow(Math.tanh(weight),2);
						let nextLayer = this.diagram[l+1];

						if(typeof nextLayer !== "undefined") {
							let width = Math.min(30,Math.abs(weight * 5) * 30);
							this.context.beginPath();
							this.context.moveTo(neuron.x, neuron.y);
							this.context.lineTo(nextLayer[w].x, nextLayer[w].y);
							this.context.lineWidth = width;
							this.context.strokeStyle = this.colorString(weight*width, 0.7);
							this.context.stroke();
						}
					}
				}

				// draw neuron itself
        // console.log(thisLayer.values[j]);
        this.context.beginPath();
        this.context.arc(neuron.x, neuron.y, neuron.r, 0, 2 * Math.PI, false);
        this.context.closePath();
				this.context.lineWidth = 15;
        this.context.strokeStyle = strokeColor;
				this.context.stroke();
				this.context.fillStyle = fillColor;
				this.context.fill();
				if (neuron.text) {
					this.context.font = `${neuron.r * 1.2}px Verdana`;
					this.context.textBaseline = 'middle';
					this.context.textAlign = 'center';
					this.context.fillStyle = textColor;
					this.context.fillText(neuron.text, neuron.x, neuron.y);
				}
			}
		}
	}

	clear() {
		// clear canvas
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.rect(0, 0, this.canvas.width, this.canvas.height);
		this.context.fillStyle = "#444444";
		this.context.fill();
	}

	click(e) {
		let rect = e.currentTarget.getBoundingClientRect();
		let coords = {x:e.clientX - rect.left, y:e.clientY - rect.top};

		let neurons = this.diagram.flat(1);
		for (let neuron of neurons) {
			if (Math.abs(neuron.x-coords.x) < neuron.r && Math.abs(neuron.y-coords.y) < neuron.r) {
				neuron.clicked = !neuron.clicked;
			}
		}
		this.draw();
	}

	// given a value between -1 and 1,
	// return a
	// -1 is red, 1 is green, 0 is black
	color(value, alpha) {
		if (typeof alpha === "undefined") alpha = 1;
		let adjVal = Math.pow(value,1);
		let r = value < 0 ? Math.abs(adjVal) * 255 : 0;
		let g = value > 0 ? adjVal * 255 : 0;
		let b = 0;
		return {r:r,g:g,b:b,a:alpha};
	}

	// given either an object of rgb values (as returned by the 'color' method),
	// or a value (a number between -1 and 1), return an rgba string
	colorString(value, alpha) {
		if (typeof value === 'number') {
			value = this.color(value, alpha);
		}
		return `rgba(${value.r},${value.g},${value.b},${value.a})`;
	}
}
