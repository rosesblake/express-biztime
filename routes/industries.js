const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`
          SELECT i.code, i.industry, c.code AS company_code
          FROM industries AS i
          LEFT JOIN company_industry AS ci ON i.code = ci.industry_code
          LEFT JOIN companies AS c ON ci.company_code = c.code;
        `);

    const industriesWithCompanies = {};
    results.rows.forEach((row) => {
      if (!industriesWithCompanies[row.code]) {
        industriesWithCompanies[row.code] = {
          industry: row.industry,
          companies: [],
        };
      }
      if (row.company_code) {
        industriesWithCompanies[row.code].companies.push(row.company_code);
      }
    });

    const response = Object.values(industriesWithCompanies);

    return res.json({ industries: response });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, industry } = req.body;

    const results = await db.query(
      "INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry",
      [code, industry]
    );
    return res.status(201).json({ industry: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/:industryCode/:companyCode", async (req, res, next) => {
  try {
    const { companyCode, industryCode } = req.params;

    const result = await db.query(
      "INSERT INTO company_industry (company_code, industry_code) VALUES ($1, $2) RETURNING company_code, industry_code",
      [companyCode, industryCode]
    );

    return res.status(201).json({ association: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});
