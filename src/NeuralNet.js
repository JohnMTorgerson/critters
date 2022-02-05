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

		this.inputNeurons = params.inputNeurons || params.input ? params.input.length : 4;
		this.outputNeurons = params.outputNeurons || 8;
		this.hiddenNeurons = params.hiddenNeurons || 10;
		this.numHiddenLayers = params.numHiddenLayers || 1;
		this.numLayers = this.numHiddenLayers + 2;

		// create an array containing the number of neurons in each layer
		let numNeurons = Array(this.numHiddenLayers).fill(this.hiddenNeurons);
		numNeurons.unshift(this.inputNeurons);
		numNeurons.push(this.outputNeurons);

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
						matrix.push(Array.from({length: numNeurons[i+1]}, () => Math.random()));
					}
					return matrix;
				})())
			}
			this.network.push(layer);
		}
		console.log(this.network);

  }

	// here we need to calculate the output of the neural network, given some sensory inputs
	// in the form of an array, one value for each input neuron
	think(inputs) {
	}


}
