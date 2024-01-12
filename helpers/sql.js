"use strict";

const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

/**
 * sqlForPartialUpdate takes two arguments:
 *      dataToUpdate: { columnName: newValue, ... }
 *      jsToSql: { columnName: "column_name", ...}
 * Both are objects.
 *
 * This function returns an object of the form {setCols, values}
 *  setCols is a comma-separated string of columns being set to different
 * parameters in SQL syntax (for example, "column1 = $1, column2 = $2")
 *  values is an array of the values that these parameters will take, pulled
 * directly from the passed-in dataToUpdate argument
 *
 * The column names in setCols come from the values in the jsToSql for any
 * keys that match across both objects; if jsToSql doesn't have a key that
 * dataToUpdate does, the string will use the key name instead
 *
 * For example, the input: {"test": 5, "test2": 6}, {"test": "test_column"}
 *
 * should produce: {
      setCols:"\"test_column\"=$1, \"test2\"=$2",
      values: [5, 6]
    }
 *
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}


/** Takes object of query params
 *
 * Returns an object with a string representing the WHERE clause, and values
 * that will be substituted as params
 *
 * Sample input (contains all valid params):
 * {
 *  nameLike: "c",
 *  minEmployees: 1,
 *  maxEmployees: 2
 * }
 *
 * Sample output (produced from sample input):
 * {
 *  whereClause: "name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3"
 *  values: ["%c%", 1, 2]
 * }
 */

//TODO: combine bottom two functions

function sqlForFilter(conditions) {

  if (Object.keys(conditions).length === 0) throw new BadRequestError("No data");

  if (Number(conditions.minEmployees) > Number(conditions.maxEmployees)) {
    throw new BadRequestError("Min employees must be less than max employees");
  }

  const subClauses = []
  const values = [];

  if ("nameLike" in conditions) {
    values.push(`%${conditions.nameLike}%`);
    subClauses.push(`name ILIKE $${values.length}`);
  }

  if ("minEmployees" in conditions) {
    if (isNaN(Number(conditions.minEmployees))) {
      throw new BadRequestError(
        `minEmployees - ${conditions.minEmployees} is not a number`);
    }

    values.push(Number(conditions.minEmployees));
    subClauses.push(`num_employees >= $${values.length}`);
  }

  if ("maxEmployees" in conditions) {
    if (isNaN(Number(conditions.maxEmployees))) {
      throw new BadRequestError(
        `maxEmployees - ${conditions.maxEmployees} is not a number`);
    }

    values.push(Number(conditions.maxEmployees));
    subClauses.push(`num_employees <= $${values.length}`);
  }

  const whereClause = subClauses.join(" AND ");
  return { whereClause, values };

}

/**
 * Takes an object of query params
 *
 * Returns an object with a string representing the WHERE clause, and values
 * that will be substituted as params
*
* Sample input (contains all valid params):
* {
*  title: "c",
*  minSalary: 1,
*  hasEquity: true
* }
*
* Sample output (produced from sample input):
* {
*  whereClause: "WHERE title ILIKE $1 AND salary >= $2 AND equity > $3"
*  values: ["%c%", 1, 0]
* }
*/

function sqlForJobFilter(conditions) {
  if (Object.keys(conditions).length === 0) throw new BadRequestError("No data");

  const subClauses = []
  const values = [];

  if ("title" in conditions) {
    values.push(`%${conditions.title}%`);
    subClauses.push(`title ILIKE $${values.length}`);
  }

  if ("minSalary" in conditions) {
    if (isNaN(conditions.minSalary)) {
      throw new BadRequestError(
        `minSalary - ${conditions.minSalary} is not a number`);
    }

    values.push(Number(conditions.minSalary));
    subClauses.push(`salary >= $${values.length}`);
  }

  if ("hasEquity" in conditions) {
    if (conditions.hasEquity !== true && conditions.hasEquity !== false) {
      throw new BadRequestError("hasEquity must be true or false");
    }

    if (conditions.hasEquity === true) {
      values.push(0);
      subClauses.push(`equity > $${values.length}`);
    }
  }

  let whereClause = '';

  if (subClauses.length >= 1){
    const whereConditions = subClauses.join(" AND ");
    whereClause = `WHERE ${whereConditions}`;
  }
  return { whereClause, values };
}


module.exports = { sqlForPartialUpdate, sqlForFilter, sqlForJobFilter };