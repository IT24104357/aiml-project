const request = require("supertest");
const app = require("../server");

describe("Auth Module", () => {

  test("Login route works", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        username: "IT24104357",
        password: "Password@123"
      });

    expect(res.statusCode).toBeLessThan(500);
  });

  test("Register route works", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        username: "TEST12345",
        email: "test@test.com",
        phone: "0771234567",
        password: "Test@123",
        role: "student"
      });

    expect(res.statusCode).toBeLessThan(500);
  });

});