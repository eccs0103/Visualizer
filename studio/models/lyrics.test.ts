"use strict";

import assert from "node:assert/strict";
import { test } from "node:test";
import { Lyrics } from "./lyrics.ts";

test("expands a line carrying several timestamps into several lines", () => {
	const lyrics = Lyrics.parse("[00:12.00][01:30.00] hello");
	assert.equal(lyrics.lines.length, 2);
	assert.equal(lyrics.lines[0].time, 12);
	assert.equal(lyrics.lines[1].time, 90);
	assert.equal(lyrics.lines[0].text, "hello");
});

test("shifts every timestamp by the offset tag", () => {
	const lyrics = Lyrics.parse("[offset:1000]\n[00:10.00] hello");
	assert.equal(lyrics.lines.length, 1);
	assert.equal(lyrics.lines[0].time, 9);
});

test("drops metadata tags", () => {
	const lyrics = Lyrics.parse("[ar:Someone]\n[ti:Song]\n[00:05.00] hello");
	assert.equal(lyrics.lines.length, 1);
	assert.equal(lyrics.lines[0].time, 5);
});

test("strips enhanced-LRC word timings from the text", () => {
	const lyrics = Lyrics.parse("[00:05.00]<00:05.00> hel<00:05.50>lo");
	assert.equal(lyrics.lines[0].text, "hello");
});

test("sorts out-of-order input by time", () => {
	const lyrics = Lyrics.parse("[00:20.00] second\n[00:05.00] first");
	assert.equal(lyrics.lines[0].text, "first");
	assert.equal(lyrics.lines[1].text, "second");
});

test("at() finds the active line, including before the first and at a boundary", () => {
	const lyrics = Lyrics.parse("[00:05.00] first\n[00:10.00] second");
	assert.equal(lyrics.at(0), -1);
	assert.equal(lyrics.at(4.9), -1);
	assert.equal(lyrics.at(5), 0);
	assert.equal(lyrics.at(9.9), 0);
	assert.equal(lyrics.at(10), 1);
});
