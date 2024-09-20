const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM companies`);
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;

    const companyResult = await db.query(
      "SELECT * FROM companies WHERE code = $1",
      [code]
    );
    const company = companyResult.rows[0];
    if (!company) {
      throw new ExpressError("Company does not exist", 404);
    }

    const industriesResult = await db.query(
      "SELECT i.industry FROM industries AS i JOIN company_industry AS ci ON i.code = ci.industry_code WHERE ci.company_code = $1",
      [code]
    );
    const industries = industriesResult.rows.map((row) => row.industry);

    return res.json({
      company: {
        code: company.code,
        name: company.name,
        description: company.description,
        industries: industries,
      },
    });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const code = slugify(name, { lower: true });

    const results = await db.query(
      "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
      [code, name, description]
    );
    return res.status(201).json({ company: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const company = await db.query("SELECT * FROM companies WHERE code=$1", [
      code,
    ]);
    if (!company.rows[0]) {
      throw new ExpressError(`can't find company with code of ${code}`, 404);
    } else {
      const results = await db.query(
        `UPDATE companies SET name=$1, description=$2 WHERE code=$3`,
        [name, description, code]
      );
      return res.send({ company: results.rows[0] });
    }
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;

    const company = await db.query("SELECT * FROM companies WHERE code = $1", [
      code,
    ]);
    if (!company.rows[0]) {
      throw new ExpressError(`Can't find company with code of ${code}`, 404);
    } else {
      await db.query("DELETE FROM companies WHERE code = $1", [code]);
      return res.send({ status: "deleted" });
    }
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
