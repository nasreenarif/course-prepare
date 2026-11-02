import test from 'node:test';
import assert from 'node:assert/strict';
import { attendeesFromText, validateBooking } from './booking-validation.mjs';
const valid = { title:'Workshop', attendees:10, startDate:'2028-02-28', endDate:'2028-02-29' };
test('booking supports valid boundaries and a real leap day',()=>{
  assert.equal(validateBooking(valid).ok,true);
  for(const attendees of [1,50]) assert.equal(validateBooking({...valid,attendees}).ok,true);
  assert.equal(validateBooking({...valid,endDate:valid.startDate}).ok,true);
});
test('booking rejects bad types, ranges, unknown fields, and date relationships',()=>{
  for(const attendees of [0,51,1.5,'10',null,NaN]) assert.equal(validateBooking({...valid,attendees}).ok,false);
  for(const startDate of ['2027-02-29','2028-02-30','2028-13-01','0000-01-01','2/28/2028']) assert.equal(validateBooking({...valid,startDate}).ok,false);
  assert.ok(validateBooking({...valid,endDate:'2028-02-27'}).fields.endDate);
  assert.equal(validateBooking({...valid,owner:'forged'}).ok,false);
});
test('form conversion preserves invalid input instead of accepting partial numbers',()=>{
  assert.equal(attendeesFromText(' 10 '),10);
  for(const text of ['', ' ', '12people', '2.5', '-1', '1e2']) assert.ok(Number.isNaN(attendeesFromText(text)));
});
