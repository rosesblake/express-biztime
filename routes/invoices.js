const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query("SELECT * FROM invoices WHERE id=$1", [id]);
    if (!results.rows[0]) {
      throw new ExpressError(`cant find invoice with id of ${id}`);
    } else {
      return res.send({ invoice: results.rows[0] });
    }
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      "INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *",
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt } = req.body;
    const invoice = await db.query("SELECT * FROM invoices WHERE id=$1", [id]);
    if (!invoice.rows[0]) {
      throw new ExpressError(`can't find company with id of ${id}`, 404);
    } else {
      const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2`, [
        amt,
        id,
      ]);
      return res.send({ invoice: results.rows[0] });
    }
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const invoice = await db.query("SELECT * FROM invoices WHERE id=$1", [id]);
    if (!invoice.rows[0]) {
      throw new ExpressError(`can't find company with id of ${id}`, 404);
    } else {
      const results = db.query("DELETE FROM invoices WHERE id=$1", [
        req.params.id,
      ]);
      return res.send({ status: "deleted" });
    }
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
