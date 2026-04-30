const request = require("supertest");
const app = require("../server");

describe("Menu Module", () => {

  test("Get menu items", async () => {
    const res = await request(app).get("/menus");
    expect(res.statusCode).toBe(200);
  });

});