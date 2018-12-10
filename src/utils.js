
const prequire = require('parent-require');

module.exports = {
    prequire: function(path) {
        try {
            return require(path);
        } catch (err) {
            return prequire(path);
        }
    }
};
