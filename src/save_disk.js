const fs = require('fs');
const docxConverter = require('docx-pdf');

/**
 * Does the FS work.
 * @returns {Promise}
 **/
class Save {
  constructor(name) {
    this.name = name;
  }
  convert() {
    var name = this.name; // `this` object cannot be accessed inside the promise.
    return new Promise(function(resolve, reject) {
      fs.readFile(`${name}.docx`, (err, data) => {
        docxConverter(`${name}.docx`, `${name}.pdf`, function(err, result) {
          if (err) reject(err);
          resolve(`${name}.pdf`);
        })
      })
    });
  }
}

module.exports = Save;
// new Save("hi").convert().then(a => console.log(a))
