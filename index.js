const Parse = require("./parse");

const p = new Parse("./december.eml", "december", 2021);

p.parse().then((d) => p.save("./out.txt", d));

//* TODO: Add year overflow - DONE
