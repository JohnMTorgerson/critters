export default class NetWidget {
	constructor(parentElement, critter) {

		// create new canvas to display diagram
		let canvas = document.createElement("canvas");
		canvas.width = 500;
		canvas.height = 700;
		parentElement.appendChild(canvas);

		// update inputs to current position;
		// when the simulation is paused, we need to manually
		// sense the next step to see where the next move will be
		critter.brain.think(critter.senseAll());

    let context = canvas.getContext("2d");
		let inputKey = ["↑", "↗", "→", "↘", "↓", "↙", "←", "↖", "GO", "X", "Y"];
    for (let i=0; i<critter.brain.network.length; i++) {
      let thisLayer = critter.brain.network[i];
      let layerLength = thisLayer.weights.length;
      let neurY = 100*(i+1);
      for (let j=0; j<layerLength; j++) {
        let spacing = canvas.width/(layerLength+1);
        let neurX = spacing*(j+1);
        // console.log(thisLayer.values[j]);
        context.beginPath();
        context.arc(neurX, neurY, 15, 0, 2 * Math.PI, false);
        context.closePath();
        context.strokeStyle = thisLayer.values._data[j] ? "green" : "white";
        context.stroke();
				if (i==0) {
					context.font = "15px Verdana";
					context.textBaseline = 'middle';
					context.textAlign = 'center';
					context.fillStyle = "#CCCCCC";
					context.fillText(inputKey[j], neurX, neurY);
				}
      }
    }
  }
}
