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


/** Takes two objects as input,
 *  conditions: {key1: "condition_as_string", ...}
 *  jsToSql: {key1: "column1_in_sql"}
 *
 * Returns a string representing the where clause
 *
 * example input: {"test": "ILIKE '%c%'", "test2": "<3"},
 *  {"test": "test_col", "test2": "test2_col"}
 * Should result in: "test_col ILIKE '%c%' AND test2 <3"
 */

function sqlForFilter(conditions){
  if (conditions?.nameLike) {
    conditions.nameLike = `name ILIKE '%${conditions.nameLike}%'`;
  }

  if(conditions?.minEmployees){
    conditions.minEmployees = `num_employees >= ${conditions.minEmployees}`;
  }

  if (conditions?.maxEmployees){
    conditions.maxEmployees = `num_employees <= ${conditions.maxEmployees}`;
  }

  const whereClause = Object.values(conditions).join(" AND ");
  return whereClause;

}

// {"column1" ILIKE $1 AND "column2" >= $2 AND "column2" <= $3}

//{ nameLike: "name", minEmployees: "num_employees", maxEmployees: "num_employees"}


module.exports = { sqlForPartialUpdate };

