"use strict";

const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilter } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("Should work", function () {
    const testData = { "test": 5, "test2": 6 };
    const testJsToSql = { "test": "test_column" };
    const sqlOutput = sqlForPartialUpdate(testData, testJsToSql);

    expect(sqlOutput).toEqual({
      setCols: '"test_column"=$1, "test2"=$2',
      values: [5, 6]
    });
  });

  test("Should not work", function () {
    const badTestData = {};
    const testJsToSql = { "test": "test_column" };

    try {
      sqlForPartialUpdate(badTestData, testJsToSql);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("sqlForFilter", function () {
  test("Should work for nameLike", function () {
    const testData = { nameLike: "c" };
    const sqlOutput = sqlForFilter(testData);
    expect(sqlOutput).toEqual({
      whereClause: `name ILIKE $1`,
      values: ["%c%"]
    });
  });

  test("Should work for minEmployees", function () {
    const testData = { minEmployees: 1 };
    const sqlOutput = sqlForFilter(testData);
    expect(sqlOutput).toEqual({
      whereClause: `num_employees >= $1`,
      values: [1]
    });
  });

  test("Should work for maxEmployees", function () {
    const testData = { maxEmployees: 2 };
    const sqlOutput = sqlForFilter(testData);
    expect(sqlOutput).toEqual({
      whereClause: `num_employees <= $1`,
      values: [2]
    });
  });

  test("Should work for nameLike, minEmployees", function () {
    const testData = { nameLike: "c", minEmployees: 1 };
    const sqlOutput = sqlForFilter(testData);
    expect(sqlOutput).toEqual({
      whereClause: `name ILIKE $1 AND num_employees >= $2`,
      values: ['%c%', 1]
    });
  });

  test("Should work for nameLike, maxEmployees", function () {
    const testData = { nameLike: "c", maxEmployees: 2 };
    const sqlOutput = sqlForFilter(testData);
    expect(sqlOutput).toEqual({
      whereClause: `name ILIKE $1 AND num_employees <= $2`,
      values: ['%c%', 2]
    });
  });

  test("Should work for minEmployees, maxEmployees", function () {
    const testData = { minEmployees: 1, maxEmployees: 2 };
    const sqlOutput = sqlForFilter(testData);
    expect(sqlOutput).toEqual({
      whereClause: `num_employees >= $1 AND num_employees <= $2`,
      values: [1, 2]
    });
  });

  test("Should work for nameLike, minEmployees, maxEmployees", function () {
    const testData = { nameLike: "c", minEmployees: 1, maxEmployees: 2 };
    const sqlOutput = sqlForFilter(testData);
    expect(sqlOutput).toEqual({
      whereClause:
        `name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3`,
      values: ['%c%', 1, 2]
    });
  });

  test("Should work for number as string for number of employees", function () {
    const testData = { minEmployees: "1", maxEmployees: "2" };
    const sqlOutput = sqlForFilter(testData);
    expect(sqlOutput).toEqual({
      whereClause: `num_employees >= $1 AND num_employees <= $2`,
      values: [1, 2]
    });
  });

  test("Should not work for nonnumber string for minEmployees", function () {
    const testData = { minEmployees: "nonnumber string" };

    try {
      sqlForFilter(testData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("Should not work for nonnumber string for maxEmployees", function () {
    const testData = { maxEmployees: "nonnumber string" };

    try {
      sqlForFilter(testData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

  test("Should work for maxEmployees === 0", function () {
    const testData = { maxEmployees: 0 };
    const sqlOutput = sqlForFilter(testData);
    expect(sqlOutput).toEqual({
      whereClause: `num_employees <= $1`,
      values: [0]
    });
  });

  //TODO: Write test for min > max

});

