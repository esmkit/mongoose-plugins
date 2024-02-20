import mongoose from "mongoose";

class DoubleType extends Number {
	constructor(v) {
		const fixedVal = v.toFixed(8);
		super(fixedVal);
		this.value = fixedVal;
		this._bsontype = "Double";
	}

	toBSON() {
		return this;
	}
}

export class ScheduleType extends Object {
	constructor(v) {
		super(v);
		this.value = v;
		this._bsontype = "Schedule";
	}

	toBSON() {
		return this;
	}
}

function isMonthlyArr(arr = []) {
	// 数组元素只允许是数字或null，不允许数字字符串、字符串、undefined等其他任何类型
	return Array.isArray(arr) && arr.length === 12 && arr.every((item) => typeof item === "number" || item === null);
}
function isSchedule(schedule, strict = true) {
	return (
		schedule !== undefined &&
		schedule !== null &&
		typeof schedule === "object" &&
		!Array.isArray(schedule) &&
		(strict ? Object.keys(schedule).length !== 0 : true) &&
		Object.entries(schedule).every(([year, arr]) => !Number.isNaN(parseInt(year)) && isMonthlyArr(arr))
	);
}

export class Schedule extends mongoose.SchemaType {
	constructor(key, options) {
		super(key, options, "Schedule");
	}

	cast(val) {
		// Validate Schedule Format here
		if (!isSchedule(val, false)) {
			throw new mongoose.SchemaType.CastError(`[ScheduleError] ${JSON.stringify(val)} is not a valid Schedule`);
		}

		// 确保传入的数值为double
		const _val = Object.entries(val || {}).reduce((temp, [feild, value]) => {
			ScheduleType.assign(temp, {
				// 将有效数值(非null)转换Double类型
				[feild]: value.map((v) => {
					if (v !== null) {
						return new DoubleType(v);
					}
					return v;
				}),
			});
			return temp;
		}, {});
		return _val;
	}
}

mongoose.Schema.Types.Schedule = Schedule;
mongoose.Types.Schedule = ScheduleType;
