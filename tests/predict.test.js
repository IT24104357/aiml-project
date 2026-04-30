const request = require("supertest");
const app = require("../server");

describe("Prediction Module", () => {

  test(
    "Prediction route works",
    async () => {
      const res = await request(app).get("/predict");
      expect(res.statusCode).toBe(200);
    },
    15000
  );

});