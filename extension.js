const translate = require('./src/index.js');
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    translate.init(context)
}

function deactivate() {
}

module.exports = {
    activate,
    deactivate
}
