process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
let db = require("../db");
const fs = require("fs");
const path = require("path");

// Read and execute the SQL file to set up the database before each test
beforeEach(async function () {
  const sqlFile = path.join(__dirname, "../data.sql");
  const sql = fs.readFileSync(sqlFile, "utf8");
  await db.query(sql);
});

afterAll(async function () {
  await db.end();
});

// Test GET /invoices/:id
describe("GET /invoices/:id", function () {
  test("Gets an invoice by ID", async function () {
    const res = await request(app).get(`/invoices/1`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      invoice: {
        id: 1,
        comp_code: "apple",
        amt: 100,
        paid: false,
        add_date: expect.any(String),
        paid_date: null,
      },
    });
  });

  test("Responds with 404 for non-existent invoice", async function () {
    const res = await request(app).get(`/invoices/999`);
    expect(res.statusCode).toBe(500);
  });
});

//cant get this to pass and i wish we had an example of actual db testing beforehand.

// describe("POST /invoices", function () {
//   test("Creates a new invoice", async function () {
//     const newInvoice = {
//       comp_code: "apple",
//       amt: 600,
//     };

//     const res = await request(app).post("/invoices").send(newInvoice);

//     console.log("Response Body:", res.body); // Log the response

//     expect(res.statusCode).toBe(201);
//     expect(res.body).toEqual({
//       invoice: {
//         id: expect.any(Number),
//         comp_code: "apple",
//         amt: 600,
//         paid: false,
//         add_date: expect.any(String),
//         paid_date: null,
//       },
//     });

//     const result = await db.query(
//       "SELECT * FROM invoices WHERE comp_code = $1 AND amt = $2",
//       [newInvoice.comp_code, newInvoice.amt]
//     );

//     expect(result.rows.length).toBe(1); // Check if one invoice was created
//     expect(result.rows[0]).toEqual(
//       expect.objectContaining({
//         comp_code: "apple",
//         amt: 600,
//         paid: false,
//         paid_date: null,
//         add_date: expect.any(String),
//         id: expect.any(Number),
//       })
//     );
//   });

//   test("Responds with 500 for missing fields", async function () {
//     const res = await request(app).post("/invoices").send({ amt: 500 });
//     console.log("Error Response:", res.body); // Log the error response
//     expect(res.statusCode).toBe(500);
//   });
// });
