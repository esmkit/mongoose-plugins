import mongoose from "mongoose";

export class DoubleType extends Number {
	private value: number;
	private _bsontype: string;

	constructor(v: any) {
		super(v);
		this.value = v;
		this._bsontype = "Double";
	}

	toBSON() {
		return this;
	}
}

export class Double extends mongoose.SchemaType {
	private $conditionalHandlers: any;
	private castForQuery: any;

	constructor(key: any, options: any) {
		super(key, options, "Double");

		Object.assign(this.$conditionalHandlers, {
			$lt: (val: any) => this.castForQuery(val),
			$lte: (val: any) => this.castForQuery(val),
			$gt: (val: any) => this.castForQuery(val),
			$gte: (val: any) => this.castForQuery(val),
		});
	}

	cast(val: any) {
		if (val == null) {
			return val;
		}
		if (val._bsontype === "Double") {
			return new DoubleType(val.value);
		}

		const _val = Number(val);
		if (Number.isNaN(_val)) {
			throw new (mongoose.SchemaType as any).CastError("Double", `${val} is not a valid double`);
		}
		return new DoubleType(_val);
	}
}

(mongoose.Schema.Types as any).Double = Double;
(mongoose.Types as any).Double = DoubleType;
