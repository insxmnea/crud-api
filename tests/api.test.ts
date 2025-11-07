import request from "supertest";
import { createServer } from "http";
import { requestHandler } from "../src/app";

jest.mock("uuid", () => ({
  v4: () => "123456789",
  validate: () => "true",
}));

const app = createServer(requestHandler);

describe("CRUD API", () => {
  let userId: string;

  test("Get all users (empty array)", async () => {
    const response = await request(app).get("/api/users");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("Create a new user", async () => {
    const userData = {
      username: "Test User",
      age: 25,
      hobbies: ["reading", "coding"],
    };

    const response = await request(app)
      .post("/api/users")
      .send(userData)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(userData);
    expect(response.body.id).toBeDefined();

    userId = response.body.id;

    console.log(userId);
  });

  test("Get created user by ID", async () => {
    const response = await request(app).get(`/api/users/${userId}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(userId);
  });

  test("Update the created user", async () => {
    const updatedData = {
      username: "Updated User",
      age: 26,
      hobbies: ["swimming"],
    };

    const response = await request(app)
      .put(`/api/users/${userId}`)
      .send(updatedData)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(updatedData);
    expect(response.body.id).toBe(userId);
  });

  test("Delete the created user", async () => {
    const response = await request(app).delete(`/api/users/${userId}`);
    expect(response.status).toBe(204);
  });

  test("Try to get deleted user", async () => {
    const response = await request(app).get(`/api/users/${userId}`);
    expect(response.status).toBe(404);
  });
});
