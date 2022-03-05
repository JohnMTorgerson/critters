import Simulator from './Simulator.js';
import Critter from './critters/Critter.js';
import Bouncer from './critters/Bouncer.js';
import Thinker from './critters/Thinker.js';
import Interactor from './critters/Interactor.js';
import Predator from './critters/Predator.js';
import Prey from './critters/Prey.js';
const { ipcRenderer } = require('electron');
const _ = require('lodash');

// declare the global Simulator object
let sim;
let canvas = document.getElementById("sim-canvas");
let context = canvas.getContext("2d");
let generation = 0;
let opts = {
	canvasSize : {
		width:  500,
		height: 500
	},
	cellSize : 5, // size of each creature/cell in the grid
  numCritters : 750, // number of critters in each generation
	numSteps : 200, // number of simulator steps each generation will last
	defaultDelay : 0, // millisecond delay between each step in the simulator
	autoplay : true, // whether to start each new generation automatically rather than pause between generations
	actionMutationRate : 0.001, // mutation rate per gene (how often the action mutates)
	weightMutationAmount : 0.001, // mutation amount added or subtracted to the weight of each gene every reproduction
	biasMutationAmount : 0.005, // mutation amount added or subtracted to the bias of each neuron every reproduction
	preyPredatorRatio: 4 // for predator-prey scenarios, the number of prey critters per predator critters
}
opts.worldWidth = Math.round(opts.canvasSize.width / opts.cellSize); // width of the canvas in cells (rather than in pixels)
opts.worldHeight = Math.round(opts.canvasSize.height / opts.cellSize); // height of the canvas in cells (rather than in pixels)

canvas.width = opts.canvasSize.width;
canvas.height = opts.canvasSize.height;

// we'll use this when loading simulations so we can load class instances dynamically
const critterClasses = {
	"Critter" : Critter,
	"Bouncer" : Bouncer,
	"Thinker" : Thinker,
	"Interactor" : Interactor,
	"Predator" : Predator,
	"Prey" : Prey
}

function main(critters) {
	// this is simply to keep the user-set speed between generations
	let delay;
	if (sim) delay = sim._delay;

	// console.log('main');
	runGeneration(opts.autoplay, () => {
		if (generation % 200 === 0 && generation>0) saveSim();

		let survivors = runSelection();
		if (survivors.length < 2) {
			window.alert('EXTINCTION');
			return;
		}

		// let offspring = runReproduction(survivors);
		let offspring = runPredPreyReproduction(survivors);
		generation++;
		// console.log('Selected and reproduced!');

		// run another generation with the offspring
		main(offspring);
	}, critters, delay);
}

function runGeneration(autoplay, cb, critters, delay) {
	document.getElementById('generation').innerHTML = 'Generation ' + generation;

	// clear canvas
	context.clearRect(0, 0, canvas.width, canvas.height);

  // draw some obstacles
	drawObstacles();

	context.fillStyle = 'red';


	// instantiate global Simulator object
	// (which will create its own new empty worldMatrix
	// and bind any critters passed to it to the new worldMatrix)
	// if critters is undefined, the simulator will create its own initial population
	sim = new Simulator(canvas, opts, cb, critters);
	if (typeof delay !== "undefined")	sim._delay = delay; // keep the user's speed setting from the previous generation, if applicable

	// if (typeof critters === "undefined") {
	// 	// if we weren't passed a population of critters,
	// 	// create initial population (with random genomes)
	// 	sim.populateInitial();
	// }

	// set keyboard events
	window.removeEventListener("keydown", addKeyboardEvents, false); // remove any old listeners
	window.addEventListener("keydown", addKeyboardEvents, false);

	// set mouse events
	canvas.removeEventListener("click", addClickEvents, false); // remove any old listeners
	canvas.addEventListener("click", addClickEvents, false);

	// if autoplay is true, play the simulation
	if (autoplay) sim.togglePause();
}

// kill the critters that didn't meet the selection criterion
function runSelection() {
	// first get rid of any empty spots (if a critter dies, it will leave an undefined entry)
	let critters = sim.critters.filter(c => typeof c !== "undefined");
	let filtered = [];

	// no filter
	// filtered = critters;

	// SE nonant
	// filtered = filtered.concat(critters.filter(critter => critter.position.x > opts.worldWidth * 2 / 3 && critter.position.y > opts.worldHeight * 2 / 3));
	// NW nonant
	// filtered = filtered.concat(critters.filter(critter => critter.position.x < opts.worldWidth / 3 && critter.position.y < opts.worldHeight / 3));
	// NE nonant
	// filtered = filtered.concat(critters.filter(critter => critter.position.x > opts.worldWidth * 2 / 3 && critter.position.y < opts.worldHeight / 3));

	// center nonant
	// filtered = filtered.concat(critters.filter(critter => critter.position.x < opts.worldWidth * 2 / 3 && critter.position.y < opts.worldHeight * 2 / 3));
	// filtered = filtered.filter(critter => critter.position.x > opts.worldWidth / 3 && critter.position.y > opts.worldHeight / 3);

	// left and top edges
	// filtered = filtered.concat(critters.filter(critter => critter.position.x < 50 || critter.position.y < 50));

	// ========= Predator/Prey specific filter rules: ============= //

	// let predators = critters.filter(c => c.constructor.name === "Predator"); // keep all predators; no selection pressure
	let predators = critters.filter(c => c.constructor.name === "Predator" && c.killCount > 0); // only keep predators who managed to kill at least one prey
	predators.sort((a,b) => b.killCount - a.killCount); // sort the predators by kill count in descending order;
	predators.splice(Math.ceil(predators.length/2)); // only keep half of the predators, those with the most kills
	// predators.map(p => {console.log(p.killCount)});
	let prey = critters.filter(c => c.constructor.name === "Prey"); // keep all the surviving prey
	filtered = [...predators, ...prey];

	return filtered;
}

function runReproduction(oldGen, numOffspring) {

	if (typeof numOffspring === "undefined") {
		numOffspring = opts.numCritters;
		console.log('Gen ' + generation + ' survivors: ' + oldGen.length + ' (' + Math.round(oldGen.length / opts.numCritters * 1000)/10 + '%)');
	}

	// before reproduction we have to empty the old simulator's worldMatrix
	// because the offspring critters will inherit it, and need room to populate;
	// later, when we run a new generation, we will create a new simulator,
	// and that simulator will bind these offspring critters to its own new worldMatrix;
	// this may seem kludgy, but later when we want to implement real-time reproduction,
	// rather than step-wise generations, this step will not be necessary
	sim.clearWorldMatrix();

	let newGen = [];

	// console.log(sim.critters);

	// loop through all the critters, pairing them up as many times as necessary
	// to fill up the number of critters we want
	// (since each pairing only produces one child, we loop around as many times as needed)
	while (newGen.length < numOffspring) {
		// loop through all the critters, pairing them up randomly to create a single child
		let temp = [...oldGen]; // this shallow copy is fine, since we're not altering the critters
		for (let i=0, halfLen = Math.floor(temp.length / 2); i < halfLen; i++) {
			let mom = temp.splice(Math.floor(Math.random() * temp.length), 1)[0];
			let dad = temp.splice(Math.floor(Math.random() * temp.length), 1)[0];

			let kid = mom.fuck(dad);

			// tell the new critter where it is in the array of critters
			// and then add it
			// kid.index = newGen.length;
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
	newGen.splice(numOffspring);

	// console.log('newGen length after trim: ' + newGen.length);

	return newGen;
}

// special reproduction function just for predator/prey scenarios
function runPredPreyReproduction(oldGen) {
	let numPreds = Math.ceil(opts.numCritters / opts.preyPredatorRatio);
	let numPrey = opts.numCritters - numPreds;

	let predParents = oldGen.filter(c => c.constructor.name === "Predator");
	let preyParents = oldGen.filter(c => c.constructor.name === "Prey");

	console.log(`Gen ${generation} (prey) survivors: ${preyParents.length} (${Math.round(preyParents.length / numPrey * 1000)/10}%)`);

	return runReproduction(predParents, numPreds).concat(runReproduction(preyParents,numPrey));
}

function drawObstacles() {

	// draw whatever shapes we want onto the canvas;
	// when the Simulator is created later, it will
	// read the canvas and store anything it finds as an obstacle

	// context.beginPath();
	// context.rect(35, 35, 35, 35);
	// context.fillStyle = 'gray';
	// context.fill();

	// context.beginPath();
	// context.rect(165, 165, 165, 165);
	// context.fillStyle = 'gray';
	// context.fill();
	//
	// context.beginPath();
	// context.rect(300, 100, 100, 100);
	// context.fillStyle = 'gray';
	// context.fill();
	//
	// context.beginPath();
	// context.rect(100, 300, 100, 100);
	// context.fillStyle = 'gray';
	// context.fill();

	// context.beginPath();
	// context.rect(330, 100, 5, 235);
	// context.fillStyle = 'gray';
	// context.fill();
	//
	// context.beginPath();
	// context.rect(100, 330, 235, 5);
	// context.fillStyle = 'gray';
	// context.fill();


	// context.beginPath();
	// context.rect(50, 50, 400, 5);
	// context.fillStyle = 'gray';
	// context.fill();

	// context.beginPath();
	// context.rect(50, 50, 5, 400);
	// context.fillStyle = 'gray';
	// context.fill();

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

function addClickEvents(e) {
	let rect = e.currentTarget.getBoundingClientRect();
	sim.click({x:e.clientX - rect.left, y:e.clientY - rect.top});
}

// save the current population of critters to a file
async function saveSim() {
	if (!sim || typeof sim.initialCritters === "undefined") {
		alert('No critters found, unable to save');
		return;
	}

	// initialCritters is the population of critters at the beginning of each generation, not the beginning of each simulation
	let critters = sim.initialCritters;

	let date = new Date();

	// save some metadata to the file (timestamp, perhaps number of generations?)
	// create json object to save
	let data = {
		gameOpts: opts,
		generation: generation,
		timestamp: date.getTime(),
		critters: []
	}

	// as we loop through the critters, save the types to a set
	let types = new Set();

	for (let critter of critters) {
		// we only need to save the params of each critter in order for them to be recreated,
		// except the first generation of critters will not have a genome passed in params, so we add it manually
		if (typeof critter.params.genome === "undefined") critter.params.genome = critter.genome;

		// save the critter's params to the critters array in the data object
		// along with class name
		data.critters.push({
			type: critter.constructor.name,
			params: _.cloneDeepWith(critter.params,(value) => {
				// since we can't clone functions, we'll save any functions as a string
				if (_.isFunction(value)) {
			    return value.toString();
			  }
			})
		});

		types.add(critter.constructor.name)
	}

	// add the types of critters as an array to the data
	data.types = Array.from(types);

	const dateStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().replace(/^(\d){1}$/,'0$1')}-${date.getDate().toString().replace(/^(\d){1}$/,'0$1')} ${date.getHours().toString().replace(/^(\d){1}$/,'0$1')}.${date.getMinutes().toString().replace(/^(\d){1}$/,'0$1')}.${date.getSeconds().toString().replace(/^(\d){1}$/,'0$1')}.${date.getMilliseconds().toString().replace(/^(\d){1}$/,'00$1').replace(/^(\d{2})$/,'0$1')}`;
	const filename = `${dateStr} - (${Array.from(types).toString()}) - gen ${data.generation}`;

	// save to file
	const msg = await ipcRenderer.invoke('write-file', {
		data: data,
		filename: filename,
		folder: 'saved_sims'
	});

	if (msg === 'success') console.log(`============== SAVE =================\n${date.toTimeString()} - saved simulation at generation ${data.generation}\n=====================================`);

	// alert(msg === 'success' ? `Saved simulation at generation ${data.generation}!` : msg);
}

async function loadSim() {
	if (sim) sim.pause();

	const data = await ipcRenderer.invoke('select-sim');
	if (typeof data === 'string') {
		// something went wrong
		console.error(data);
		alert(data);
		return;
	}

	// console.log(JSON.stringify(fileContents.gameOpts));

	// set game options and canvas size and generation
	opts = data.gameOpts;
	canvas.width = opts.canvasSize.width;
	canvas.height = opts.canvasSize.height;
	generation = data.generation;

	// in the future, load obstacles here (we aren't saving those yet)

	// make a dummy worldMatrix so each critter can be created with a position;
	// later, the real worldMatrix will be created by the sim;
	// this is a stupid way to do things, so we should probably just allow for
	// a critter to be created with no position and have the sim assign it one;
	// for now, I'm just doing this because it's easier, we'll change it later
	let dummyWorldMatrix = (() => {
		let cols = Math.round(canvas.width / opts.cellSize);
		let rows = Math.round(canvas.height / opts.cellSize);
		// return Array(rows).fill(Array(cols).fill(null)); // <-- this doesn't appear to work, since every row is just a reference to the same row
		let matrix = [];
		for (let r=0; r<rows; r++) {
			let row = [];
			for (let c=0; c<cols; c++) {
				row.push(null);
			}
			matrix.push(row);
		}
		return matrix;
	})();


	// create critters array
	// let critters = data.critters.map((obj) => new critterClasses[obj.type](canvas, [], opts, obj.params));
	let critters = data.critters.map((obj) => {
		obj.params.genome.internalParams.osc = {
			on: true,
			period: 10
		};

		return new critterClasses[obj.type](canvas, dummyWorldMatrix, opts, obj.params);
	});

	// start game with loaded critters
	main(critters);
}



window.onload = function() {
	document.getElementById("save-btn").addEventListener("click", (e) => {
		saveSim();
	}, false);
	document.getElementById("load-btn").addEventListener("click", (e) => {
		loadSim();
	}, false);

	main();
};
