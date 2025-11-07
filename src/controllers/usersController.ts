import { IncomingMessage, ServerResponse } from "http";
import usersService from "../services/usersService";
import { isValidUUID, isValidUserData } from "../utils/validation";

export const getUsers = (req: IncomingMessage, res: ServerResponse) => {
  const users = usersService.getAllUsers();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(users));
};

export const getUserById = (
  req: IncomingMessage,
  res: ServerResponse,
  id: string
) => {
  if (!isValidUUID(id)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Invalid user ID" }));
    return;
  }

  const user = usersService.getUserById(id);
  if (!user) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "User not found" }));
    return;
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(user));
};

export const createUser = (req: IncomingMessage, res: ServerResponse) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const userData = JSON.parse(body);

      if (!isValidUserData(userData)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message:
              "Invalid user data. Required fields: username (string), age (number), hobbies (array of strings or empty array)",
          })
        );
        return;
      }

      const newUser = usersService.createUser(userData);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newUser));
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid JSON" }));
    }
  });
};

export const updateUser = (
  req: IncomingMessage,
  res: ServerResponse,
  id: string
) => {
  if (!isValidUUID(id)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Invalid user ID" }));
    return;
  }

  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const userData = JSON.parse(body);

      if (!isValidUserData(userData)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message:
              "Invalid user data. Required fields: username (string), age (number), hobbies (array of strings or empty array)",
          })
        );
        return;
      }

      const updatedUser = usersService.updateUser(id, userData);
      if (!updatedUser) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User not found" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(updatedUser));
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid JSON" }));
    }
  });
};

export const deleteUser = (
  req: IncomingMessage,
  res: ServerResponse,
  id: string
) => {
  if (!isValidUUID(id)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Invalid user ID" }));
    return;
  }

  const deleted = usersService.deleteUser(id);
  if (!deleted) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "User not found" }));
    return;
  }

  res.writeHead(204);
  res.end();
};
