"use strict";

const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("Should work", function () {
    const testData = { "test": 5, "test2": 6 };
    const testJsToSql = { "test": "test_column" };
    const sqlOutput = sqlForPartialUpdate(testData, testJsToSql);

    expect(sqlOutput).toEqual({
      setCols: "\"test_column\"=$1, \"test2\"=$2",
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