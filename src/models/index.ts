import Shift from "./shift.js";
import Assignment from "./assignment.js";
import User from "./user.js";


User.belongsToMany(Shift, {
	through: Assignment,
	foreignKey: "staffId",
	otherKey: "shiftId",
	as: "shifts",
	onDelete: "CASCADE",
	onUpdate: "CASCADE"
});

Shift.belongsToMany(User, {
	through: Assignment,
	foreignKey: "shiftId",
	otherKey: "staffId",
	as: "staffs",
	onDelete: "CASCADE",
	onUpdate: "CASCADE"
});