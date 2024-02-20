import mongoose from "mongoose";

const INT32_MAX = 0x7fffffff;
const INT32_MIN = -0x80000000;

export class IntegerType extends Number {
	constructor(v) {
		super(v);
		this.value = v;
		this._bsontype = "Int32";
	}

	toBSON() {
		return this;
	}
}

export class Integer extends mongoose.SchemaType {
	constructor(key, options) {
		super(key, options, "Int32");

		Object.assign(this.$conditionalHandlers, {
			$lt: (val) => this.castForQuery(val),
			$lte: (val) => this.castForQuery(val),
			$gt: (val) => this.castForQuery(val),
			$gte: (val) => this.castForQuery(val),
		});
	}

	cast(val) {
		if (val == null || val === "") {
			return val;
		}

		const _val = Number(val);
		if (Number.isNaN(_val)) {
			throw new mongoose.SchemaType.CastError("Number", `${val} is not a valid number`);
		}

		if (_val < INT32_MIN || _val > INT32_MAX) {
			throw new mongoose.SchemaType.CastError("Number", `${val} is outside of the range of valid BSON int32s`);
		}

		return new IntegerType(_val.toFixed(8));
	}
}

mongoose.Schema.Types.Integer = Integer;
mongoose.Types.Integer = IntegerType;
