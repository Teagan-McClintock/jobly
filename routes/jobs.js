"use strict";

/**Routes for jobs */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobFilterSchema = require("../schemas/jobFilter.json");

const router = new express.Router();

/** POST /
 *
 * Takes JSON of { title, salary, equity, companyHandle } as input
 * via the request body and attempts to create a job in the database.
 *
 * Returns (job: { id, title, salary, equity, company_handle }}
 *
 * Authorization required: admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    jobNewSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, company_handle }, ...] }
 *
 * Can filter on provided search filters:
 * -title (will find case_insensitive, partial matches)
 * -minSalary
 * -hasEquity
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next){
  const queryKeys = Object.keys(req.query);
  if (queryKeys.length >= 1){
    const validator = jsonschema.validate(
      req.query,
      jobFilterSchema,
      { required: true }
    );

    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    };

    const jobs = await Job.findFiltered(req.query);
    return res.json({ jobs });
  }
  else {
    const jobs = await Job.findAll();
    return res.json({ jobs });
  }
})

/** GET /[id]  =>  { job }
 *
 *  Company is { id, title, salary, equity, company_handle }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  const job = await Job.get(req.params.id);
  return res.json({ job });
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * job is { id, title, salary, equity, company_handle }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    jobUpdateSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.update(req.params.id, req.body);
  return res.json({ job });
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  await Job.remove(req.params.id);
  return res.json({ deleted: req.params.id });
});





module.exports = router;

