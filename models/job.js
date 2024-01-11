"use strict";

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

  static async create({ title, salary, equity, companyHandle }){

  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   */

  static async findAll() {

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

  }

  /** Delete specified job; returns {deleted: id}
   *
   * Throws NotFoundError if company not found
   */

  static async remove(id) {

  }
}

module.exports = Job;