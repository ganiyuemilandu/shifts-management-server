import { DataTypes, Model } from "sequelize";
import type { BelongsToManyAddAssociationMixin, BelongsToManyAddAssociationsMixin, BelongsToManyGetAssociationsMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyRemoveAssociationsMixin } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";

import { type ShiftProps } from "@/schemas/shift.js";
import { sequelize } from "@/databases/mysql.js";
import type Staff from "./user.js";


class Shift extends Model<InferAttributes<Shift>, InferCreationAttributes<Shift>> implements ShiftProps {
	declare id: CreationOptional<number>;
	declare title: string;
	declare location: string;
	declare start: Date;
	declare end: Date;
	declare break: CreationOptional<number>;
	declare remark: string;

	declare addStaff: BelongsToManyAddAssociationMixin<Staff, number>;
	declare addStaffs: BelongsToManyAddAssociationsMixin<Staff, number>;
	declare getStaffs: BelongsToManyGetAssociationsMixin<Staff>;
	declare removeStaff: BelongsToManyRemoveAssociationMixin<Staff, number>;
	declare removeStaffs: BelongsToManyRemoveAssociationsMixin<Staff, number>;
}

Shift.init({
	id: {
		type: DataTypes.INTEGER.UNSIGNED,
		autoIncrement: true,
		primaryKey: true
	},
	title: {
		type: DataTypes.STRING(64),
		allowNull: false,
	},
	location: {
		type: DataTypes.STRING(128),
		allowNull: false
	},
	start: {
		type: DataTypes.DATE,
		allowNull: false
	},
	end: {
		type: DataTypes.DATE,
		allowNull: false
	},
	break: {
		type: DataTypes.TINYINT.UNSIGNED,
		allowNull: false,
		defaultValue: 0
	},
	remark: {
		type: DataTypes.STRING(256),
		allowNull: false,
	}
}, {
	indexes: [
		{
			fields: ["title"]
		},
		{
			fields: ["location"]
		},
		{
			fields: ["start"]
		},
		{
			fields: ["location", "start"],
			unique: true
		}
	],
	timestamps: false,
	tableName: "shifts",
	sequelize
});

export type ShiftAttributes = InferAttributes<Shift>;

export default Shift;