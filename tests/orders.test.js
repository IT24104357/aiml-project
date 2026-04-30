const request = require("supertest");
const app = require("../server");

describe("Orders Module", () => {

  test("Get all orders", async () => {
    const res = await request(app).get("/orders");
    expect(res.statusCode).toBe(200);
  });

});