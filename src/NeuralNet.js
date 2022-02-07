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
		// each layer will consist of an object containing a values matrix and a weights matrix
		// (the output layer will not contain a weight matrix);
		// the values matrix is a 1-dimensional matrix with one value for each neuron in that layer;
		// the weights matrix is 2-d, containing each weight connecting each neuron to every neuron in the next layer
		this.network = [];

		// create a random neural network
		// loop through each layer, creating the 'layer' object containing both values and weights for that layer
		for(let i=0; i<this.numLayers; i++) {
			let layer = {
				values: math.zeros(numNeurons[i]), //math.matrix(Array.from({length: numNeurons[i]}, () => Math.random())), // 1-d matrix with random values for each neuron in this layer
				weights: math.matrix((() => {
					// create a 2-d matrix with the number of columns corresponding to the number of neurons in the following layers
					// and the number of rows corresponding to the number of neurons in this layer;
					// fill with random values, representing the weights of the connections between layers for each neuron
					let matrix = [];
					for (let j=0; j<numNeurons[i]; j++) {
						matrix.push(Array.from({length: numNeurons[i+1]}, () => 2 * Math.random() - 1 ));
					}
					return matrix;
				})())
			}
			this.network.push(layer);
		}
		// console.log('Network:');
		// console.log(this.network);

  }

	// here we need to calculate the output of the neural network, given some sensory inputs
	// in the form of an array, one value for each input neuron
	think(inputs) {
		// map inputs to the first layer of the network
		this.network[0].values = math.matrix(inputs);

		// calculate the rest of the layers
		for (let i=0; i<this.network.length-1; i++) {
			// do the matrix multiplication, yielding the raw values
			// for each neuron in the next layer
			let unnormalized = math.multiply(this.network[i].values, this.network[i].weights);
			// then normalize the values
			let normalized = unnormalized.map((value, index, matrix) => {
				return Math.tanh(value);
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

			choices = choices.concat(Array.from(Array(Math.floor(Math.pow(value,2) * 100)), () => neuron));
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

	// a method to change any individual weight between two neurons
	// layer tells us which layer to work on
	// index should be a two-element array to address a cell in that layer's weight matrix
	// (e.g. [0,4] would address the weight connecting the first neuron in this layer to the 5th neuron in the next layer)
	// value is the value to change the weight to
	setWeight(layer, index, value) {
		// check if the index exists in this layer
		// check if the value is in bounds (-1 - 1)
		// if so, change the value
	}


}
