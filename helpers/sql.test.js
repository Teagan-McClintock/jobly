"use strict";

const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function(){
  test("Should work", function(){
    const testData = {"test": 5, "test2": 6};
    const testJsToSql = {"test": "test_column"};
    const sqlOutput = sqlForPartialUpdate(testData, testJsToSql);

    expect(sqlOutput).toEqual({
      setCols:"\"test_column\"=$1, \"test2\"=$2",
      values: [5, 6]
    });
  });
});