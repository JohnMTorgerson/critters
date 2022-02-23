// -------- Prey class -------- //
import Interactor from './Interactor.js'

export default class Prey extends Interactor {
	constructor(canvas, worldMatrix, gameOpts, params) {
		super(canvas, worldMatrix, gameOpts, params)
	}

	_birth(params) {
		return new Prey(this.canvas, this.worldMatrix, this.gameOpts, params);
	}
}
