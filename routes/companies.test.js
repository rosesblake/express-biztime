process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
let db = require("../db");
const fs = require("fs");
const path = require("path");

// read the sql file to setup db before each
beforeEach(async function () {
  const sqlFile = path.join(__dirname, "../data.sql");
  const sql = fs.readFileSync(sqlFile, "utf8");
  await db.query(sql);
});

afterAll(async function () {
  await db.end();
});

describe("GET /companies", function () {
  test("Gets list of companies", async function () {
    const res = await request(app).get(`/companies`);

    expect(res.statusCode).toBe(200);

    expect(res.body).toEqual({
      companies: [
        { code: "apple", name: "Apple Computer", description: "Maker of OSX." },
        { code: "ibm", name: "IBM", description: "Big blue." },
      ],
    });
  });
});

describe("GET /companies/:code", function () {
  test("Gets a company by code", async function () {
    const res = await request(app).get(`/companies/apple`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: {
        code: "apple",
        name: "Apple Computer",
        description: "Maker of OSX.",
        invoices: [
          {
            id: 1,
            comp_code: "apple",
            amt: 100,
            paid: false,
            add_date: "2024-09-20T07:00:00.000Z",
            paid_date: null,
          },
          {
            id: 2,
            comp_code: "apple",
            amt: 200,
            paid: false,
            add_date: "2024-09-20T07:00:00.000Z",
            paid_date: null,
          },
          {
            id: 3,
            comp_code: "apple",
            amt: 300,
            paid: true,
            add_date: "2024-09-20T07:00:00.000Z",
            paid_date: "2018-01-01T08:00:00.000Z",
          },
        ],
      },
    });
  });

  test("Responds with 404 for non-existent company", async function () {
    const res = await request(app).get(`/companies/nonexistent`);
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /companies", function () {
  test("Creates a new company", async function () {
    const newCompany = {
      code: "newco",
      name: "New Company",
      description: "A new company description.",
    };

    const res = await request(app).post("/companies").send(newCompany);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: {
        code: "newco",
        name: "New Company",
        description: "A new company description.",
      },
    });

    // Verify the company was added to the database
    const result = await db.query("SELECT * FROM companies WHERE code = $1", [
      newCompany.code,
    ]);
    expect(result.rows.length).toBe(1);
    expect(result.rows[0]).toEqual(expect.objectContaining(newCompany));
  });

  test("Responds with 500 for missing fields", async function () {
    const res = await request(app)
      .post("/companies")
      .send({ code: "missingfields" }); // Missing name and description

    expect(res.statusCode).toBe(500); // Adjust this based on your error handling
  });
});
