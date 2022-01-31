import Simulator from './Simulator.js';
import Critter from './Critter.js';

// declare the global Simulator object
var sim;

function initiate() {
	// get canvas element
	let canvas = document.getElementById("theCanvas");
  let context = canvas.getContext("2d");

  // draw some obstacles
  context.beginPath();
  context.rect(250, 50, 15, 400);
  context.fillStyle = 'black';
  context.fill();

  let cellSize = 5;
  let numCritters = 1000;
	let defaultDelay = 30; // millisecond delay between each step in the simulator

	// instantiate global Simulator object
	sim = new Simulator(canvas, defaultDelay);

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

  // create critter population
	for (var i=0; i<numCritters; i++) {
    // random position
    let x;
    let y;
    do {
      x = Math.floor(Math.random() * canvas.width / cellSize) * cellSize + (cellSize/2);
      y = Math.floor(Math.random() * canvas.height / cellSize) * cellSize + (cellSize/2);
    } while (context.getImageData(x, y, 1, 1).data[3] !== 0);

    // // random color
		// var r = Math.round(255 * Math.random());
		// var g = Math.round(255 * Math.random());
		// var b = Math.round(255 * Math.random());
		// var color = 'rgba(' + r + ',' + g + ',' + b + ',1)';
    let genome = getRandomGenome();

		sim.critters.push(new Critter(canvas, cellSize, x, y, genome));
	}


	// draw initial position of all the bodies
	for (var i=0; i<sim.critters.length; i++) {
		sim.critters[i].draw();
	}

}

function getRandomGenome() {
  let zeroThruEight = () => Math.floor(Math.random() * 9);

  return {
  	0: {
			action: [zeroThruEight(),zeroThruEight(),0][Math.floor(Math.random()*3)],
			weight: Math.random()
  	},
  	1: {
			action: zeroThruEight(),
			weight: Math.random()
  	},
  	2: {
  		action: zeroThruEight(),
  		weight: Math.random()
  	},
  	3: {
  		action: zeroThruEight(),
  		weight: Math.random()
  	},
  	4: {
  		action: zeroThruEight(),
  		weight: Math.random()
  	},
  	5: {
  		action: zeroThruEight(),
  		weight: Math.random()
  	},
  	6: {
  		action: zeroThruEight(),
  		weight: Math.random()
  	},
  	7: {
  		action: zeroThruEight(),
  		weight: Math.random()
  	},
  	8: {
  		action: zeroThruEight(),
  		weight: Math.random()
  	},
    color: 'red'
  }
}

window.onload = function() {
  initiate();
};
