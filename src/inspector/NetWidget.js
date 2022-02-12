export default class NetWidget {
	constructor(canvas, critter) {

    let context = canvas.getContext("2d");
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
      }
    }
  }
}
