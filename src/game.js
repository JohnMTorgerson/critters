import Simulator from './Simulator.js';
import Critter from './Critter.js';

// declare the global Simulator object
let sim;
let canvas;
let generation = 0;
let opts = {
	cellSize : 5, // size of each creature/cell in the grid
  numCritters : 500, // number of critters in each generation
	numSteps : 150, // number of simulator steps each generation will last
	defaultDelay : 0, // millisecond delay between each step in the simulator
	actionMutationRate : 0.01, // mutation rate per gene (how often the action mutates)
	weightMutationAmount : 0.001 // mutation amount added or subtracted to the weight of each gene every reproduction
}

function main(critters) {
	// console.log('main');
	runGeneration(true, () => {
		let survivors = runSelection();
		console.log('Gen ' + generation + ' survivors: ' + survivors.length + ' (' + Math.round(survivors.length / opts.numCritters * 1000)/10 + '%)');
		let offspring = runReproduction(survivors);
		generation++;
		// console.log('Selected and reproduced!');

		// run another generation with the offspring
		main(offspring);
	}, critters);
}

function runGeneration(autoplay, cb, critters) {
	document.getElementById('generation').innerHTML = 'Generation ' + generation;

	// get canvas element
	canvas = document.getElementById("theCanvas");
  let context = canvas.getContext("2d");

	// clear event listeners
	// clear canvas
	context.clearRect(0, 0, canvas.width, canvas.height);

  // draw some obstacles

  context.beginPath();
  context.rect(165, 165, 165, 165);
  context.fillStyle = 'gray';
  context.fill();

	context.beginPath();
	context.rect(300, 100, 100, 100);
	context.fillStyle = 'gray';
	context.fill();

	context.beginPath();
	context.rect(100, 300, 100, 100);
	context.fillStyle = 'gray';
	context.fill();



	// instantiate global Simulator object
	sim = new Simulator(canvas, opts, cb, critters);

	if (typeof critters === "undefined") {
		// if we weren't passed a population of critters,
		// create initial population (with random genomes)
		sim.populateInitial();
	}

	// set keyboard events
	window.removeEventListener("keydown", addKeyboardEvents, false); // remove any old listeners
	window.addEventListener("keydown", addKeyboardEvents, false);

	// if autoplay is true, play the simulation
	if (autoplay) sim.togglePause();
}

// kill the critters that didn't meet the selection criterion
function runSelection() {
	let filtered = [];
	// SE nonant
	filtered = filtered.concat(sim.critters.filter(critter => critter.position.x > canvas.width * 2 / 3 && critter.position.y > canvas.height * 2 / 3));
	// NW nonant
	filtered = filtered.concat(sim.critters.filter(critter => critter.position.x < canvas.width / 3 && critter.position.y < canvas.height / 3));
	// NE nonant
	// filtered = filtered.concat(sim.critters.filter(critter => critter.position.x > canvas.width * 2 / 3 && critter.position.y < canvas.height / 3));

	// center nonant
	// filtered = filtered.concat(sim.critters.filter(critter => critter.position.x < canvas.width * 2 / 3 && critter.position.y < canvas.height * 2 / 3));
	// filtered = filtered.filter(critter => critter.position.x > canvas.width / 3 && critter.position.y > canvas.height / 3);

	return filtered;
}

// bug: currently, critters will overlap, since they aren't being drawn as they are being created
function runReproduction(oldGen) {
	let newGen = [];

	// console.log(sim.critters);

	// loop through all the critters, pairing them up as many times as necessary
	// to fill up the number of critters we want
	// (since each pairing only produces one child, we loop around as many times as needed)
	while (newGen.length < opts.numCritters) {
		// loop through all the critters, pairing them up randomly to create a single child
		let temp = [...oldGen]; // this single-layer "deep" copy is fine, since we're not altering the critters
		for (let i=0, halfLen = Math.floor(temp.length / 2); i < halfLen; i++) {
			let mom = temp.splice(Math.floor(Math.random() * temp.length), 1)[0];
			let dad = temp.splice(Math.floor(Math.random() * temp.length), 1)[0];

			// let kid = new Critter(canvas, opts, {
			// 	genome : mom.fuck(dad)
			// });

			let kid = mom.fuck(dad);

			newGen.push(kid);

			// console.log('mom, dad, kid:');
			// console.log(mom.genome);
			// console.log(dad.genome);
			// console.log(kid.genome);
		}
	}

	// console.log('newGen length: ' + newGen.length);

	// now newGen.length should be >= the number of critters we want,
	// so trim it down to exactly the number we want
	newGen.splice(opts.numCritters);

	// console.log('newGen length after trim: ' + newGen.length);

	return newGen;
}

function addKeyboardEvents(e) {
	switch (e.keyCode) {
		case 32: // space bar
			console.log('**********   PLAY/PAUSE   **********');
			e.preventDefault();
			sim.togglePause(); // toggle play/pause
			break;
		case 189: // minus
			console.log('**********     SLOWER     **********');
			sim.slower(); // slow animation
			break;
		case 187: // plus
			console.log('**********     FASTER     **********');
			sim.faster(); // speed up animation
			break;
		case 48: // 0
			console.log('**********  NORMAL SPEED  **********');
			sim.defaultSpeed(); // reset animation to original speed
			break;
		// case 67: // c
		// 	console.log('**********    RECENTER    **********');
		// 	sim.requestCenterCOM = true; // recenter all the bodies on the canvas at the end of the next step
		// 	break;
		// case 83: // s
		// 	console.log('******* SHOW/HIDE OFFSCREEN ********');
		// 	sim.showOffCanvas = !sim.showOffCanvas; // show/hide the coordinates of all offscreen bodies
		// 	break;
	}
}


window.onload = function() {
	main();
};
