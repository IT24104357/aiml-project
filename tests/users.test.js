const request = require("supertest");
const app = require("../server");

describe("Users Module", () => {

  test("Get users", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toBe(200);
  });

});