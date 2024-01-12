"use strict";

const { query } = require("express");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilter } = require("../helpers/sql");

class Job {
  /** Create a job (from data), update db, return new job data.
 *
 * data should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(`
                INSERT INTO jobs (title, salary, equity, company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING id, title, salary, equity, company_handle`,
      [title, salary, equity, companyHandle]);
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   */

  static async findAll() {
    const result = await db.query(`
      SELECT id, title, salary, equity, company_handle
      FROM jobs`);

    return result.rows;

  }

  /**
   * TODO: Detail on findFiltered
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   *
   * The results will be filtered based on the conditions in the input
   */

  static async findFiltered(conditions) {

  }

  /** Given a job Id, return data about the job
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   */

  static async get(id) {
    const result = await db.query(`
      SELECT id, title, salary, equity, company_handle
      FROM jobs
      WHERE id = $1`, [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;

  }

  /** Updated job data with data provided in input
   *
   * Not all fields need to be provided.
   *
   * Data can include: { title, salary, equity}
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
    UPDATE jobs
    SET ${setCols}
    WHERE id = ${handleVarIdx}
    RETURNING
      id, title, salary, equity, company_handle`;

    console.log("***** QUERYSQL: ", querySql);
    console.log("***** VALUES: ", values);
    console.log("***** ID: ", id);
    
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;

  }

  /** Delete specified job; returns {deleted: id}
   *
   * Throws NotFoundError if company not found
   */

  static async remove(id) {
    const result = await db.query(`
      DELETE
      FROM jobs
      WHERE id = $1
      RETURNING id`, [id]);

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return { deleted: id }

  }
}

module.exports = Job;