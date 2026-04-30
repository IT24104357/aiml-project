const request = require("supertest");
const app = require("../server");

describe("Sales Module", () => {

  test("Sales report works", async () => {
    const res = await request(app).get("/sales");
    expect(res.statusCode).toBe(200);
  });

});