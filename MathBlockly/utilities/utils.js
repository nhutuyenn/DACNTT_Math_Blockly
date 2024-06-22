const ejs = require('ejs');
const path = require('path');

function renderPartial(template, data) {
    const filePath = path.join(__dirname, 'views', template);
    return new Promise((resolve, reject) => {
        ejs.renderFile(filePath, data, (err, str) => {
            if (err) {
                reject(err);
            } else {
                resolve(str);
            }
        });
    });
}

module.exports = { renderPartial };
