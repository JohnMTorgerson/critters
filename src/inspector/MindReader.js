import CellWidget from './CellWidget.js';
import NetWidget from './NetWidget.js';

export default class MindReader {
	constructor(element, critter) {
		element.innerHTML = '';

		//let cellWidget = new CellWidget(element, critter);
		let netWidget = new NetWidget(element, critter);
  }
}
