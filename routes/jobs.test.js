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

  test("gets filtered jobs works", async function () {
    const resp = await request(app)
      .get("/jobs")
      .query({ title: "j", minSalary: "1", hasEquity: "true" });

    expect(resp.body).toEqual({jobs: [{
      id: expect.any(Number),
      title: "j2",
      salary: 2,
      equity: "0.01",
      company_handle: "c2"
    }]});
  });

  test("gets filtered jobs throws error with extra params", async function () {
    const resp = await request(app)
      .get("/jobs")
      .query({ title: "j", minSalary: "1", hasEquity: "true", bad: "yes" });

    expect(resp.statusCode).toEqual(400);
  });

  test("Filtering out all jobs does not throw error", async function () {
    const resp = await request(app)
      .get("/jobs")
      .query({ title: "toolong", minSalary: "1", hasEquity: "true" });

    expect(resp.body).toEqual({jobs: []});
  });
});

/************************************** GET /jobs/:id */

beforeEach(async function () {
  const results = await Job.findAll();
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

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  beforeEach(async function () {
    const results = await Job.findAll();
    j1Id = results[0].id;
  });

  test("works for admins", async function () {
    const resp = await request(app)
      .patch(`/jobs/${j1Id}`)
      .send({
        title: "j1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: j1Id,
        title: "j1-new",
        salary: 1,
        equity: '0',
        company_handle: "c1"
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/${j1Id}`)
      .send({
        title: "j1-new",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
      .patch(`/jobs/${j1Id}`)
      .send({
        name: "j1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "j0-bad",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on company change attempt - admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/${j1Id}`)
      .send({
        company_handle: "c1-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data - admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/${j1Id}`)
      .send({
        salary: "good",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauthorized nonadmin on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/${j1Id}`)
      .send({
        salary: "good",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});


/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {

  beforeEach(async function () {
    const results = await Job.findAll();
    j1Id = results[0].id;
  });

  test("works for admin users", async function () {
    const resp = await request(app)
      .delete(`/jobs/${j1Id}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: `${j1Id}` });

    try {
      await Job.get(`${j1Id}`);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .delete(`/jobs/${j1Id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
      .delete(`/jobs/${j1Id}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("unauthorized nonadmin for no such job", async function () {
    const resp = await request(app)
      .delete(`/jobs/0`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});


