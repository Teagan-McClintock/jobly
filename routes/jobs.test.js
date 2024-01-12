"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
const { NotFoundError } = require("../expressError");
const Job = require("../models/job");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

let j1Id;

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "testNew",
    salary: 1000,
    equity: 0.5,
    companyHandle: "c1"
  };

  test("ok for admins", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual(
      {
        job: {
          id: expect.any(Number),
          title: "testNew",
          salary: 1000,
          equity: '0.5',
          company_handle: "c1"
        }
      });
  });

  test("not ok for non-admin users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data - admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "testNew",
        salary: 1000,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data - admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "testNew",
        salary: "salary", //this is the invalid line
        companyHandle: "test"
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauthorized nonadmin with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "testNew",
        salary: "salary", //this is the invalid line
        companyHandle: "test"
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

});

/************************************** GET /jobs */

describe("GET /jobs", function () {

  test("gets all jobs works", async function () {
    const resp = await request(app)
      .get("/jobs");

    expect(resp.body).toEqual({
      jobs: [{
        id: expect.any(Number),
        title: "j1",
        salary: 1,
        equity: "0",
        company_handle: "c1"
      },
      {
        id: expect.any(Number),
        title: "j2",
        salary: 2,
        equity: "0.01",
        company_handle: "c2"
      }]
    });

  });
});

/************************************** GET /job/:id */

beforeEach(async function() {
  const results = await Job.findAll()
  j1Id = results[0].id;
});

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${j1Id}`);
    expect(resp.body).toEqual({
      job: {
        id: j1Id,
        title: "j1",
        salary: 1,
        equity: '0',
        company_handle: "c1"
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});



