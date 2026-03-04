import { DataTypes, Model } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { sequelize } from "##/databases/mysql";
import type { AssignmentProps } from "##/schemas/assignment";


class Assignment extends Model<InferAttributes<Assignment>, InferCreationAttributes<Assignment>> implements AssignmentProps {
	declare staffId: number;
	declare shiftId: number;
	declare status: CreationOptional<"accepted" | "declined">;
	declare clockedIn: CreationOptional<Date>;
	declare clockedOut: CreationOptional<Date>;
	declare breakStart: CreationOptional<Date>;
	declare breakEnd: CreationOptional<Date>;
	declare declineNote: CreationOptional<string>;
}

Assignment.init({
	staffId: {
		type: DataTypes.INTEGER.UNSIGNED,
		primaryKey: true,
		allowNull: false
	},
	shiftId: {
		type: DataTypes.INTEGER.UNSIGNED,
		primaryKey: true,
		allowNull: false
	},
	status: DataTypes.ENUM("accepted", "declined"),
	clockedIn: DataTypes.DATE,
	clockedOut: DataTypes.DATE,
	breakStart: DataTypes.DATE,
	breakEnd: DataTypes.DATE,
	declineNote: DataTypes.STRING(100)
}, {
	timestamps: false,
	tableName: "assignments",
	modelName: "assignment",
	sequelize
});

export type AssignmentAttributes = InferAttributes<Assignment>;

export default Assignment;