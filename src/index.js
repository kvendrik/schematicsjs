let Schematics = require('./Schematics');

if(typeof window !== 'undefined'){
    window.Schematics = Schematics;
} else if(typeof module !== 'undefined' && module.exports) {
    module.exports = Schematics;
}
