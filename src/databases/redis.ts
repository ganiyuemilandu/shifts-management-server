import { createClient, type RedisClientType } from "redis";

export const redisClient: RedisClientType = createClient({
	socket: {
		host: "localhost",
		reconnectStrategy: (retries: number) => {
			if (retries > 10)
				return new Error("too many tries");
			return Math.min(retries * 50, 500);
		}
	},
	password: process.env["REDIS_PASSWORD"] as string,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export const connect = async () => {
	try {
		if (!redisClient.isOpen)
			await redisClient.connect();
	} catch (error) {
		throw error;
		}
};

export const disconnect = async () => {
	try {
		if (redisClient.isOpen)
			await redisClient.quit();
	} catch (error) {
		throw error;
	}
};