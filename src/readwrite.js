const electron = require('electron');
const fs = require('fs');
const path = require('path');
// const {v4: uuidv4} = require('uuid');

(function() {

  // saves javascript object to file location.
  // Takes an optional folderPath to save to, otherwise saves to appData.
  const write = (data, filename, folder) => {
    // add extension to the filename
    filename = filename + '.json';

    // sort out the folder path
    userDataPath = electron.app.getPath('userData');

    if (typeof folder === "undefined") {
      // if no folder was passed, use the user data folder by default
      folder = userDataPath;
    } else if (!path.isAbsolute(folder)) {
      // if a relative folder path was passed, make it relative to the user data folder
      folder = path.join(userDataPath,folder);
    }

    // if the folder doesn't exist, create it
    if (!fs.existsSync(folder)) {
      try {
        fs.mkdirSync(folder);
      } catch(err) {
        console.error(`Unable to create folder ${folder}\n${err}`);
        return `Unable to create folder ${folder}`;
      }
    }

    // create the final filepath
    const filepath = path.join(folder, filename);

    // write the data to the file
    try {
      fs.writeFileSync(filepath, JSON.stringify(data));
      console.log(`==== SAVING ====\n${filename}\ntimestamp: ${data.timestamp}\ngeneration: ${data.generation}\n================`);
    } catch(err) {
      console.error("Error writing to file: " + err.toString());
      return `Error writing to file!`;
    }

    return 'success';
  }

  // loads data from save file to object
  const read = (filepath) => {
    try {
      return JSON.parse(fs.readFileSync(filepath));
    } catch(err) {
      // if there was some kind of error, return an error message
      console.error(`Could not find ${filepath}\n${err.toString()}`);
      return `Could not find ${filepath}`;
    }
  }

  module.exports.write = (data, filename, folder) => write(data, filename, folder);
  module.exports.read = (filepath) => read(filepath);
}());
