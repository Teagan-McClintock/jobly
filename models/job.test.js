"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

let j1Id;

// beforeEach function to ensure we have access to the Id of job with title "j1"
beforeEach(async function() {
  const results = await db.query(`SELECT id
  FROM jobs
  WHERE title = 'j1'`);
  j1Id = results.rows[0].id;
});

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "j3",
    salary: 3,
    equity: 1,
    companyHandle: "c3"
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "j3",
      salary: 3,
      equity: '1',
      company_handle: "c3"
    });

    // Checking to see if added job is in db

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
        FROM jobs
        WHERE title = 'j3'`);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "j3",
        salary: 3,
        equity: '1',
        company_handle: "c3"
      }

    ]);
  });
});


/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 1,
        equity: '0',
        company_handle: "c1"
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 2,
        equity: '0.01',
        company_handle: "c2"
      }
    ]);
  });
});

/************************************** findAll */
// TODO: not yet ....


/************************************** get */

describe("get", function () {
  test("works", async function () {

    let job = await Job.get(j1Id);

    expect(job).toEqual(
      {
        id: j1Id,
        title: "j1",
        salary: 1,
        equity: '0',
        company_handle: "c1"
      });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "j3",
    salary: 3,
    equity: 1
  };

  test("works", async function () {
    let job = await Job.update(j1Id, updateData);
    expect(job).toEqual({
      id: j1Id,
      title: "j3",
      salary: 3,
      equity: '1',
      company_handle: "c1"
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
        FROM jobs
        WHERE id = 1`
    );

    expect(result.rows).toEqual([{
      id: j1Id,
      title: "j3",
      salary: 3,
      equity: '1',
      company_handle: "c1"
    }]);
  });

  test("works with nulls", async function() {
    const updateDataSetNulls = {
      title: "j3",
      salary: null,
      equity: null
    };

    let job = await Job.update(j1Id, updateDataSetNulls);
    expect(job).toEqual({
      id: j1Id,
      title: "j3",
      salary: null,
      equity: null,
      company_handle: "c1"
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
        FROM jobs
        WHERE id = 1`
    );

    expect(result.rows).toEqual([{
      id: j1Id,
      title: "j3",
      salary: null,
      equity: null,
      company_handle: "c1"
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(j1Id, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });

});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(j1Id);
    const res = await db.query(
      `SELECT id FROM companies WHERE id=${j1Id}`);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(0);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});