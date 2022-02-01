import Simulator from './Simulator.js';
import Critter from './Critter.js';

// declare the global Simulator object
let sim;
let canvas;
let opts = {
	cellSize : 5, // size of each creature/cell in the grid
  numCritters : 2000,
	defaultDelay : 20, // millisecond delay between each step in the simulator
	actionMutationRate : 0.01, // mutation rate per gene (how often the action mutates)
	weightMutationAmount : 0.001 // mutation amount added or subtracted to the weight of each gene every reproduction
}

async function main() {
	await runGeneration();
	let survivors = runSelection();
	let offspring = runReproduction(survivors);
}

function runGeneration(autoplay) {
	// get canvas element
	canvas = document.getElementById("theCanvas");
  let context = canvas.getContext("2d");

  // draw some obstacles
  context.beginPath();
  context.rect(250, 50, 15, 400);
  context.fillStyle = 'black';
  context.fill();

	// instantiate global Simulator object
	sim = new Simulator(canvas, opts);

	// set keyboard events
	window.addEventListener("keydown", function(e) {
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
	}, false);

	// create initial population (with random genomes)
	sim.populateInitial();

	// if autoplay is true, play the simulation
	if (autoplay) sim.togglePause();
}

// kill the critters that didn't meet the selection criterion
function runSelection() {
	return sim.critters.filter(critter => critter.position.x > canvas.width / 2);
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

			let kid = new Critter(canvas, opts, {
				genome : mom.fuck(dad)
			});

			newGen.push(kid);

			// console.log('mom, dad, kid:');
			// console.log(mom.genome);
			// console.log(dad.genome);
			// console.log(kid.genome);
		}
	}

	console.log('newGen length: ' + newGen.length);

	// now newGen.length should be >= the number of critters we want,
	// so trim it down to exactly the number we want
	newGen.splice(opts.numCritters);

	console.log('newGen length after trim: ' + newGen.length);

	return newGen;
}


window.onload = function() {
	main();
};
