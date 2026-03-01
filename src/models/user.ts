import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DataTypes, Model } from "sequelize";
import type { BelongsToManyAddAssociationMixin, BelongsToManyAddAssociationsMixin, BelongsToManyGetAssociationsMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyRemoveAssociationsMixin } from "sequelize";
import type { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";

import { sequelize } from "@/databases/mysql.js";
import { redisClient } from "@/databases/redis.js";
import { type ProfileProps } from "@/schemas/user.js";
import { HTTPError } from "@/utils/index.js";
import type Shift from "./shift.js";


type JWTSecretKey = "ACCESS" | "REFRESH" | "EMAIL";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> implements ProfileProps {
	declare id: CreationOptional<number>;
	declare firstName: string;
	declare lastName: string;
	declare role: CreationOptional<"admin" | "staff">;
	declare email: string;
	declare password: string;
	declare verified: CreationOptional<boolean>;

	declare addShift: BelongsToManyAddAssociationMixin<Shift, number>;
	declare addShifts: BelongsToManyAddAssociationsMixin<Shift, number>;
	declare getShifts: BelongsToManyGetAssociationsMixin<Shift>;
	declare removeShift: BelongsToManyRemoveAssociationMixin<Shift, number>;
	declare removeShifts: BelongsToManyRemoveAssociationsMixin<Shift, number>;

	isAdmin(): boolean {
		return this.role === "admin";
	}

	isSelf(id: UserAttributes["id"]): boolean {
		return this.id === id;
	}

	signToken(secretKey: JWTSecretKey, expiresIn: jwt.SignOptions["expiresIn"]): string {
		const secret = process.env[`JWT_${secretKey}_SECRET`]!;
		const payload: Partial<UserAttributes> = { id: this.id, role: this.role };
		return jwt.sign(payload, secret, { expiresIn: expiresIn! });
	}

	async validatePassword(password: string): Promise<boolean> {
		return await bcrypt.compare(password, this.password);
	}

	override toJSON(): Omit<UserAttributes, "password" | "verified"> {
		const values = super.toJSON();
		delete (values as Partial<UserAttributes>).password;
		delete (values as Partial<UserAttributes>).verified;
		return values;
	}

	override toString(): string {
		return JSON.stringify(super.toJSON());
	}

	static verifyToken(token: string, secretKey: JWTSecretKey): Pick<UserAttributes, "id" | "role"> | null {
		if (!token || !token.length)
			return null;
		try {
			const secret = process.env[`JWT_${secretKey}_SECRET`] || secretKey;
			return jwt.verify(token, secret) as UserAttributes;
		} catch (err) {
			return null;
		}
	}

	static async parse(token: string, secretKey: JWTSecretKey): Promise<User> {
		if (!token || !token.length)
			throw new HTTPError("Unauthorized: Missing token", 401);
		const attributes = User.verifyToken(token, secretKey);
		if (!attributes)
			throw new HTTPError("Unauthorized: Invalid token", 401);
		const data = await redisClient.get(`user:${attributes.id}:profile`);
		const profile = data && JSON.parse(data) as UserAttributes | null;
		const user = profile? User.build(profile): await User.findOne({ where: attributes });
		if (!user || user.role !== attributes.role)
			throw new HTTPError("Forbidden: Obsolete token", 403);
		return user;
	}
}


User.init({
	id: {
		type: DataTypes.INTEGER.UNSIGNED,
		autoIncrement: true,
		primaryKey: true
	},
	firstName: {
		type: DataTypes.STRING(32),
		allowNull: false
	},
	lastName: {
		type: DataTypes.STRING(32),
		allowNull: false
	},
	role: {
		type: DataTypes.ENUM("admin", "staff"),
		defaultValue: "staff"
	},
	email: {
		type: DataTypes.STRING(64),
		unique: true,
		allowNull: false
	},
	password: {
		type: DataTypes.STRING(256),
		allowNull: false
	},
	verified: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
}, {
	hooks: {
		beforeSave: async (user) => {
			if (user.changed("firstName"))
				user.firstName = user.firstName[0]!.toUpperCase() + user.firstName.substring(1).toLowerCase();
			if (user.changed("lastName"))
				user.lastName = user.lastName[0]!.toUpperCase() + user.lastName.substring(1).toLowerCase();
			if (user.changed("email"))
				user.email = user.email.toLowerCase();
			if (user.changed("password"))
				user.password = await bcrypt.hash(user.password, 10);
		}
	},
	defaultScope: {
		where: { verified: true }
	},
	indexes: [
		{ fields: ["firstName"] },
		{ fields: ["lastName"] }
	],
	tableName: "users",
	sequelize
});


export type UserAttributes = InferAttributes<User>;

export default User;