const math = require('mathjs')

export default class NeuralNet {
	constructor(params) {
		if (typeof params === 'undefined') {
			params = {};
		}
		// params example:
		// params = {
		// 	inputNeurons: 5,
		// 	outputNeurons: 8,
		// 	hiddenNeurons: 10,
		// 	numHiddenLayers: 1
		// }

		this.inputNeurons = params.inputNeurons || (params.input ? params.input.length : 4);
		this.outputNeurons = params.outputNeurons || 8;
		this.hiddenNeurons = params.hiddenNeurons || 10;
		this.numHiddenLayers = typeof params.numHiddenLayers ===  "undefined" ? 1 : params.numHiddenLayers;
		this.numLayers = this.numHiddenLayers + 2;

		// create an array containing the number of neurons in each layer
		let numNeurons = Array(this.numHiddenLayers).fill(this.hiddenNeurons);
		numNeurons.unshift(this.inputNeurons);
		numNeurons.push(this.outputNeurons);
		// console.log(numNeurons);

		// the network will be represented by an array, one element for each layer;
		// each layer will consist of an object containing a values matrix, a weights matrix, and a biases matrix
		// (the input layer's bias matrix will be empty)
		// (the output layer's weight matrix will be empty);
		// the values matrix is a 1-dimensional matrix with one value for each neuron in that layer;
		// the weights matrix is 2-d, containing each weight connecting each neuron to every neuron in the next layer
		// the biases matrix is 1-d, one bias for each neuron in that layer
		this.network = [];

		// create a random neural network
		// loop through each layer, creating the 'layer' object containing values and weights and biases for that layer
		for(let i=0; i<this.numLayers; i++) {
			let layer = {
				values: math.zeros(numNeurons[i]), //math.matrix(Array.from({length: numNeurons[i]}, () => Math.random())), // 1-d matrix with random values for each neuron in this layer
				weights: (() => {
					// create a 2-d matrix with the number of columns corresponding to the number of neurons in the following layers
					// and the number of rows corresponding to the number of neurons in this layer;
					// fill with random values, representing the weights of the connections between layers for each neuron
					let matrix = [];
					for (let j=0; j<numNeurons[i]; j++) {
						matrix.push(Array.from({length: numNeurons[i+1]}, () => this.randWeight(numNeurons[i]))); // randWeight() uses normal distribution and divides by sqrt of number of input neurons to keep values in a good range
					}
					return matrix;
				})(),
				biases: Array.from({length: numNeurons[i]}, () => this.randBias())
			}
			this.network.push(layer);
		}
		// console.log('Network:');
		// console.log(this.network);

  }

	// here we need to calculate the output of the neural network, given some sensory inputs
	// in the form of an array, one value for each input neuron
	think(inputs) {
		// console.log(`inputs: ${inputs.length}`);
		// map inputs to the first layer of the network
		this.network[0].values = math.matrix(inputs);

		// calculate the rest of the layers
		for (let i=0; i<this.network.length-1; i++) {
			// do the matrix multiplication, yielding the raw values
			// for each neuron in the next layer
			let unnormalized = math.multiply(this.network[i].values, this.network[i].weights);
			// then normalize the values
			let normalized = unnormalized.map((value, index, matrix) => {
				// first, add the bias
				let normV = value + this.network[i+1].biases[index];

				// normalize to within 0 and 1 using sigmoid function
				normV = (Math.tanh(normV) + 1) / 2;

				// and (except for the final layer) convert to discrete values, either 0 or 1
				// if (i < this.network.length-2) {
				// 	normV = Math.round(normV); // intermediate layers should either be 0 or 1
				// }


				return normV;
			});

			// assign the normalized values to the next layer
			this.network[i+1].values = normalized;
		}

		// now choose an output neuron based on the values in the final layer
		// using a weighted random scheme
		let outputLayer = this.network[this.network.length-1];
		// let highestVal = Number.MIN_SAFE_INTEGER;
		// let highestNeuron = -1;
		let choices = [];
		outputLayer.values.map((value, index) => {
			let neuron = index[0];

			// if (value > highestVal) {
			// 	highestVal = value;
			// 	highestNeuron = neuron;
			// }

			// set lower threshold
			if (value < 0.5) return;

			choices = choices.concat(Array.from(Array(Math.floor(Math.pow(Math.max(value,0),3) * 10)), () => neuron));
		});

		// console.log("output layer: " + outputLayer.values);
		// console.log("activated neuron: " + highestNeuron + ', value: ' + highestVal);
		// return highestNeuron;

		// console.log(choices);

		if (choices.length > 0) {
			return choices[Math.floor(Math.random() * choices.length)];
		}
		return null;
	}

	// // a method to change any individual weight between two neurons
	// // layer tells us which layer to work on
	// // index should be a two-element array to address a cell in that layer's weight matrix
	// // (e.g. [0,4] would address the weight connecting the first neuron in this layer to the 5th neuron in the next layer)
	// // value is the value to change the weight to
	// setWeight(layer, index, value) {
	// 	// check if the index exists in this layer
	// 	// check if the value is in bounds (-1 - 1)
	// 	// if so, change the value
	// 	if (this.getWeight(layer, index) && value >= -1 && value < 1) {
	// 		this.network[layer].subset(math.index(index), value);
	// 	}
	// }
	//
	// // get an individual weight, given a layer and a two-dimensional index (e.g. [1,3])
	// getWeight(layer, index) {
	// 	return this.network[layer].weights.subset(math.index(index));
	// }

	randWeight(numNeurons) {
		return this._gaussianRand(4) / Math.pow(numNeurons,0.5);
	}

	randBias() {
		return this._gaussianRand(1);
	}

	_gaussianRand(width) {
		let factor = 10;
	  let rand = 0;

	  for (let i=0; i<factor; i++) {
	    rand += Math.random();
	  }

	  return (rand/factor * width) - (width/2);
	}
}
