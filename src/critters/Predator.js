// -------- Predator class -------- //
import Interactor from './Interactor.js'
import Critter from './Critter.js';
import Bouncer from './Bouncer.js';
import Thinker from './Thinker.js';
import Prey from './Prey.js';
import Obstacle from '../items/Obstacle.js';


export default class Predator extends Interactor {
	constructor(canvas, worldMatrix, gameOpts, params) {
		super(canvas, worldMatrix, gameOpts, params)

		if (typeof params.digestDelay !== "undefined") {
			this.digestDelay = params.digestDelay;
		} else {
			this.digestDelay = 20;
		}

		// the kill count will increment every time we kill a Prey critter;
		// this can be used as a selection criterion by the game
		this.killCount = 0;
		this.counter = 0;
	}

	countDown() {
		this.counter = Math.max(0,this.counter - 1);
		// console.log(this.counter);
	}

	move() {
		this.countDown();

		// call super.move(), which will move the critter if there is nothing in the way
		// in the direction that it wants to move; but we also store the move it wants to make,
		// so that we can detect if the thing in the way is a Prey object, and if it is, kill it;
		let move = super.move();

		let thing = this._sense({x:move.x,y:move.y});
		if (thing instanceof Prey && this.counter === 0) {
			return this.kill(thing);
		}
	}

	kill(prey) {
		this.counter = this.digestDelay;

		let {x,y} = prey.position;
		// console.log(`Killed Prey at ${x},${y}, index:${prey.index} (counter is ${this.counter})`);

		this.worldMatrix[y][x] = null; // remove the prey object from the worldMatrix;
		this.killCount++; // increment kill count
		return {kill: prey.index}; // return an object telling the simulator to remove the prey object from the list of critters it loops through each step
	}

	_birth(params) {
		return new Predator(this.canvas, this.worldMatrix, this.gameOpts, params);
	}
}
