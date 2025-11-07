import { createServer } from "http";
import dotenv from "dotenv";
import { requestHandler } from "./app";

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = createServer(requestHandler);

server.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error("Server error:", error);
  }
  process.exit(1);
});
