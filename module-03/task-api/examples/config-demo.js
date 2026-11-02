import "dotenv/config";

const rawPort = process.env.PORT ?? "3000";
const port = Number(rawPort);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("Invalid PORT");
}

const uri = process.env.MONGODB_URI;
console.log("PORT:", port);
console.log("Database setting present:",
  typeof uri === "string" && uri.trim() !== "");
