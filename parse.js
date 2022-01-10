const EmlParser = require("eml-parser");
const fs = require("fs");

const months = [
	"JANUARY",
	"FEBRUARY",
	"MARCH",
	"APRIL",
	"MAY",
	"JUNE",
	"JULY",
	"AUGUST",
	"SEPTEMBER",
	"OCTOBER",
	"NOVEMBER",
	"DECEMBER",
];

class Parse {
	constructor(fileName, month) {
		this.fileName = fileName;
		this.month = month.toUpperCase();
	}

	async parse() {
		try {
			const stream = fs.createReadStream(this.fileName);
			const parser = new EmlParser(stream);

			const read = await parser.parseEml();
			return this.parsed(read.text);
		} catch (e) {
			console.log(e);
			return null;
		}
	}

	parsed(str) {
		const go = str.split("\n");

		let foundNum = false;
		let index = 0;
		const days = [];

		for (let i = 0; i < go.length; i++) {
			if (go[i] && !isNaN(go[i])) {
				foundNum = true;
				const dayNumber = go[i];
				days.push(dayNumber);
				continue;
			}

			if (foundNum) {
				index = i;
				break;
			}
		}

		// There will be days of the week listed after the numbers.
		// The # of days of the week corresponds to the number of days on the schedule.
		// So, we can find the last index where the day numbers end and skip past the weekday names
		let firstNameIndex = index + days.length + 1;

		const outObject = {};

		while (true) {
			if (firstNameIndex + days.length + 1 > go.length) {
				break;
			}

			const toPush = [];
			let currentMonth = this.month;
			//	console.log(days);
			for (let i = 0; i < days.length; i++) {
				if (go[firstNameIndex + 1 + i]) {
					const o = {};

					const dateToPush = `${currentMonth}${days[i]}`;
					if (outObject[dateToPush] === undefined) {
						outObject[dateToPush] = {
							stamp: `2021-${(months.indexOf(currentMonth) + 1).toLocaleString(
								"en-US",
								{ minimumIntegerDigits: 2, useGrouping: false }
							)}-${days[i].toLocaleString("en-US", {
								minimumIntegerDigits: 2,
								useGrouping: false,
							})}`,
							people: [],
						};
					}

					outObject[dateToPush].people.push({
						name: go[firstNameIndex],
						time: go[firstNameIndex + 1 + i],
					});

					// o["work"] = {
					// 	name: go[firstNameIndex],
					// 	time: go[firstNameIndex + 1 + i],
					// };
					//o[days[i]] = go[firstNameIndex + 1 + i];
					//	toPush.push(o);
				}
				const day = parseInt(days[i]);
				if (
					day >
					new Date(2021, months.indexOf(currentMonth)).monthDays() - 1
				) {
					const currMonthIndex = months.indexOf(currentMonth);
					if (currMonthIndex + 1 > 11) {
						currentMonth = months[0];
					} else {
						currentMonth = months[currMonthIndex + 1];
					}
				}
			}

			//	outObject[go[firstNameIndex]] = toPush;
			firstNameIndex = firstNameIndex + days.length + 1;
		}

		//console.log(outObject);

		// fs.writeFileSync("./out.txt", JSON.stringify({ shifts: outObject }));

		// for (let i = 0; i < outObject.people["LUCAS C"].length; i++) {
		// 	if (outObject.people["LUCAS C"][i].work.day === "3") {
		// 		console.log("yes");
		// 	}
		// }
		// console.log(Object.keys(outObject.people["LUCAS C"]));
		return outObject;
	}
}

Date.prototype.monthDays = function () {
	var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
	return d.getDate();
};

module.exports = Parse;
