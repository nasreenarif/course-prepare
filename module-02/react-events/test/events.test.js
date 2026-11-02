import test from 'node:test';
import assert from 'node:assert/strict';
import { initialEvents } from '../src/data/events.js';
import { filterEvents, toggleSaved, validateEvent, formatDate } from '../src/lib/events.js';

const valid = { title: '  Study Group  ', category: 'Technology', date: '2027-02-10', location: ' Library ', capacity: '25' };
test('creation trims text and converts form capacity to a number', () => {
  const result = validateEvent(valid);
  assert.deepEqual(result.errors, {});
  assert.equal(result.value.title, 'Study Group');
  assert.equal(result.value.location, 'Library');
  assert.equal(result.value.capacity, 25);
});
test('empty and forged fields produce actionable field errors', () => {
  assert.deepEqual(Object.keys(validateEvent({ title: ' ', category: 'Unknown', date: '', location: '', capacity: '' }).errors).sort(),
    ['capacity', 'category', 'date', 'location', 'title']);
});
test('calendar dates and capacity boundaries are enforced', () => {
  assert.ok(validateEvent({ ...valid, date: '2027-02-30' }).errors.date);
  assert.ok(validateEvent({ ...valid, date: '2027-02-29' }).errors.date);
  assert.deepEqual(validateEvent({ ...valid, date: '2028-02-29', capacity: '500' }).errors, {});
  for (const capacity of ['0', '501', '1.5', 'abc']) assert.ok(validateEvent({ ...valid, capacity }).errors.capacity);
});
test('search combines title/location, category, and saved filters', () => {
  const saved = toggleSaved(initialEvents, 'react-workshop');
  assert.equal(filterEvents(saved, ' LIBRARY ', 'Technology', true)[0].id, 'react-workshop');
  assert.equal(filterEvents(saved, 'library', 'Arts', false).length, 0);
  assert.equal(filterEvents(saved, '', '', true).length, 1);
  assert.equal(filterEvents(saved, 'no such place', '', false).length, 0);
});
test('save and unsave preserve previous state and unrelated records', () => {
  const previous = initialEvents.map(event => Object.freeze({ ...event }));
  const next = toggleSaved(Object.freeze(previous), 'react-workshop');
  assert.equal(previous[0].saved, false);
  assert.equal(next[0].saved, true);
  assert.equal(next[1], previous[1]);
  assert.equal(toggleSaved(next, 'react-workshop')[0].saved, false);
});
test('date display preserves the calendar day independently of local timezone', () => {
  assert.equal(formatDate('2027-02-10'), 'February 10, 2027');
});
