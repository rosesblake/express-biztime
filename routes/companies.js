const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

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

    const results = await db.query("SELECT * FROM companies WHERE code = $1", [
      code,
    ]);
    company = results.rows[0];

    // Query for invoices associated with the company
    const invoicesResult = await db.query(
      "SELECT * FROM invoices WHERE comp_code = $1",
      [code]
    );
    const invoices = invoicesResult.rows;

    return res.json({
      company: {
        code: company.code,
        name: company.name,
        description: company.description,
        invoices: invoices,
      },
    });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
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
    const company = await db.query("SELECT * FROM companies WHERE code=$1", [
      code,
    ]);
    if (!company.rows[0]) {
      throw new ExpressError(`can't find company with code of ${code}`, 404);
    } else {
      const results = db.query("DELETE FROM companies WHERE code=$1", [
        req.params.code,
      ]);
      return res.send({ status: "deleted" });
    }
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
