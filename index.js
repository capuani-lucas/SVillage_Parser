const Parse = require("./parse");

const p = new Parse("./schedules/march.eml", "march", 2022);

p.parse().then((d) => p.save("./out.txt", d));

//* TODO: Add year overflow - DONE`
