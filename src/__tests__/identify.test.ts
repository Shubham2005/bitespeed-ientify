import request from "supertest";
import app from "../app";
import { pool } from "../db";

beforeAll(async () => {
  // Clear table before running tests
  await pool.query(`DELETE FROM "Contact"`);
});

afterAll(async () => {
  await pool.end();
});

describe("Identity API Tests", () => {

  test("should return 400 if no email and phone provided", async () => {
    const res = await request(app).post("/identify").send({});
    expect(res.statusCode).toBe(400);
  });

  test("should create a new primary contact", async () => {
    const res = await request(app)
      .post("/identify")
      .send({
        email: "lorraine@hillvalley.edu",
        phoneNumber: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.contact.emails).toContain("lorraine@hillvalley.edu");
    expect(res.body.contact.phoneNumbers).toContain("123456");
    expect(res.body.contact.secondaryContactIds.length).toBe(0);
  });

  test("same request should not create duplicate contact", async () => {
    const res = await request(app)
      .post("/identify")
      .send({
        email: "lorraine@hillvalley.edu",
        phoneNumber: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.contact.secondaryContactIds.length).toBe(0);
  });

  test("should create secondary contact for same phone new email", async () => {
    const res = await request(app)
      .post("/identify")
      .send({
        email: "mcfly@hillvalley.edu",
        phoneNumber: "123456"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.contact.emails).toContain("mcfly@hillvalley.edu");
    expect(res.body.contact.secondaryContactIds.length).toBe(1);
  });

  test("should merge two primary contacts correctly", async () => {

    // Create independent contact
    await request(app).post("/identify").send({
      email: "george@hillvalley.edu",
      phoneNumber: "919191"
    });

    await request(app).post("/identify").send({
      email: "biff@hillvalley.edu",
      phoneNumber: "717171"
    });

    // Merge them
    const res = await request(app).post("/identify").send({
      email: "george@hillvalley.edu",
      phoneNumber: "717171"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.contact.emails.length).toBeGreaterThanOrEqual(2);
  });

});