const test = require("node:test");
const assert = require("node:assert/strict");

process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-key";
const { tools, buildSystemInstruction, TIME_ZONE } = require("../lib/gemini");

test("tool declarations expose exactly checkAvailability and createBooking", () => {
  const names = tools[0].functionDeclarations.map((f) => f.name);
  assert.deepEqual(names, ["checkAvailability", "createBooking"]);
});

test("createBooking requires name, email, purpose, startTime but not endTime (duration is fixed and computed by the tool)", () => {
  const decl = tools[0].functionDeclarations.find((f) => f.name === "createBooking");
  assert.deepEqual(
    [...decl.parameters.required].sort(),
    ["email", "name", "purpose", "startTime"].sort()
  );
  assert.equal("endTime" in decl.parameters.properties, false);
});

test("buildSystemInstruction embeds the given date so relative times ('tomorrow'/'αύριο') anchor to it", () => {
  const now = new Date("2026-07-29T10:00:00.000Z");
  const instruction = buildSystemInstruction(now);
  assert.match(instruction, /2026-07-29T10:00:00\.000Z/);
  assert.match(instruction, new RegExp(TIME_ZONE));
});

test("buildSystemInstruction defaults to the current date when called with no args", () => {
  const before = Date.now();
  const instruction = buildSystemInstruction();
  const after = Date.now();
  const match = instruction.match(/Current date\/time: (.+?) \(/);
  assert.ok(match, "instruction should contain a current date/time line");
  const embedded = new Date(match[1]).getTime();
  assert.ok(embedded >= before - 1000 && embedded <= after + 1000);
});

test("buildSystemInstruction tells the model to resolve relative times before calling tools", () => {
  const instruction = buildSystemInstruction();
  assert.match(instruction, /absolute ISO 8601/);
});

test("booking rules tell the model not to re-ask for a purpose already established in context", () => {
  const instruction = buildSystemInstruction();
  assert.match(instruction, /already clear from earlier context/);
});

test("system instruction pins the correct Greek spelling of the owner's name so the model doesn't improvise a transliteration", () => {
  const instruction = buildSystemInstruction();
  assert.match(instruction, /Παντελής Στανήμερος/);
});

test("system instruction states the Monday-Friday 10:00-20:00 booking window and 30-minute duration", () => {
  const instruction = buildSystemInstruction();
  assert.match(instruction, /Monday–Friday/);
  assert.match(instruction, /10:00–20:00/);
  assert.match(instruction, /exactly 30 minutes/);
});
