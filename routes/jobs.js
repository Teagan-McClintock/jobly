"use strict";

/**Routes for jobs */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

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
// router.post("/", ensureAdmin, async function() {

// });

module.exports = router;