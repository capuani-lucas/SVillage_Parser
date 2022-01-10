const Parse = require("./parse");

const p = new Parse("./december.eml", "December");

p.parse().then(console.log);

// TODO: Add year overflow
