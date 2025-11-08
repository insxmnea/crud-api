import { IncomingMessage, ServerResponse } from "http";
import * as usersController from "../controllers/usersController";

export const handleUsersRoute = (req: IncomingMessage, res: ServerResponse) => {
  const { method, url } = req;
  const urlParts = url?.split("/") || [];

  if (
    urlParts.length === 3 &&
    urlParts[1] === "api" &&
    urlParts[2] === "users"
  ) {
    // Route: /api/users
    switch (method) {
      case "GET":
        usersController.getUsers(req, res);
        break;
      case "POST":
        usersController.createUser(req, res);
        break;
      default:
        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Method Not Allowed" }));
    }
  } else if (
    urlParts.length === 4 &&
    urlParts[1] === "api" &&
    urlParts[2] === "users"
  ) {
    // Route: /api/users/{userId}
    const userId = urlParts[3];

    switch (method) {
      case "GET":
        usersController.getUserById(req, res, userId);
        break;
      case "PUT":
        usersController.updateUser(req, res, userId);
        break;
      case "DELETE":
        usersController.deleteUser(req, res, userId);
        break;
      default:
        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Method Not Allowed" }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Endpoint not found" }));
  }
};
