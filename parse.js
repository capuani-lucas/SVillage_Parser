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
	constructor(fileName, month, year) {
		this.fileName = fileName;
		this.month = month.toUpperCase();
		this.year = year;
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

		// Search through html until we find our first day of the week
		// Store all days of the week for this schedule
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
			let currentMonth = this.month;
			let currentYear = this.year;
			for (let i = 0; i < days.length; i++) {
				if (go[firstNameIndex + 1 + i]) {
					const dateToPush = `${currentMonth}${days[i]}`;
					if (outObject[dateToPush] === undefined) {
						outObject[dateToPush] = {
							stamp: `${currentYear}-${(
								months.indexOf(currentMonth) + 1
							).toLocaleString("en-US", {
								minimumIntegerDigits: 2,
								useGrouping: false,
							})}-${parseInt(days[i]).toLocaleString("en-US", {
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
				}
				const day = parseInt(days[i]);
				// Check to see if we have switched to the next month
				if (
					day >
					new Date(currentYear, months.indexOf(currentMonth)).monthDays() - 1
				) {
					const currMonthIndex = months.indexOf(currentMonth);
					if (currMonthIndex + 1 > 11) {
						// Switching from DECEMBER to JANUARY
						currentMonth = months[0];
						currentYear++;
					} else {
						currentMonth = months[currMonthIndex + 1];
					}
				}
			}
			firstNameIndex = firstNameIndex + days.length + 1;
		}

		return outObject;
	}

	save(location, output) {
		fs.writeFileSync(location, JSON.stringify({ shifts: output }));
	}
}

// Get number of days for month
Date.prototype.monthDays = function () {
	var d = new Date(this.getFullYear(), this.getMonth() + 1, 0);
	return d.getDate();
};

module.exports = Parse;
