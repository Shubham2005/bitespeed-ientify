"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const db_1 = require("../db");
beforeAll(async () => {
    // Clear table before running tests
    await db_1.pool.query(`DELETE FROM "Contact"`);
});
afterAll(async () => {
    await db_1.pool.end();
});
describe("Identity API Tests", () => {
    test("should return 400 if no email and phone provided", async () => {
        const res = await (0, supertest_1.default)(app_1.default).post("/identify").send({});
        expect(res.statusCode).toBe(400);
    });
    test("should create a new primary contact", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
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
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/identify")
            .send({
            email: "lorraine@hillvalley.edu",
            phoneNumber: "123456"
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.contact.secondaryContactIds.length).toBe(0);
    });
    test("should create secondary contact for same phone new email", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
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
        await (0, supertest_1.default)(app_1.default).post("/identify").send({
            email: "george@hillvalley.edu",
            phoneNumber: "919191"
        });
        await (0, supertest_1.default)(app_1.default).post("/identify").send({
            email: "biff@hillvalley.edu",
            phoneNumber: "717171"
        });
        // Merge them
        const res = await (0, supertest_1.default)(app_1.default).post("/identify").send({
            email: "george@hillvalley.edu",
            phoneNumber: "717171"
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.contact.emails.length).toBeGreaterThanOrEqual(2);
    });
});
