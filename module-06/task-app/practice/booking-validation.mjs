// Optional project exercise; this is not an enabled Task App endpoint.
function calendarDate(value) {
  if (typeof value !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) return false;
  if (value.slice(0, 4) === '0000') return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateBooking(body) {
  const fields = {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, fields, formError: 'Send a booking object.' };
  }
  if (Object.keys(body).some(key => !['title','attendees','startDate','endDate'].includes(key))) {
    return { ok: false, fields, formError: 'An unexpected field was supplied.' };
  }
  if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 200) fields.title = 'Use a title of 1–200 characters.';
  if (!Number.isInteger(body.attendees) || body.attendees < 1 || body.attendees > 50) fields.attendees = 'Choose a whole number from 1 to 50.';
  if (!calendarDate(body.startDate)) fields.startDate = 'Choose a valid start date.';
  if (!calendarDate(body.endDate)) fields.endDate = 'Choose a valid end date.';
  if (!fields.startDate && !fields.endDate && body.endDate < body.startDate) fields.endDate = 'End date must be on or after start date.';
  if (Object.keys(fields).length) return { ok: false, fields, formError: '' };
  return { ok: true, value: { title: body.title.trim(), attendees: body.attendees, startDate: body.startDate, endDate: body.endDate } };
}

export function attendeesFromText(raw) {
  // Form controls yield strings. Preserve blank as invalid rather than Number('') === 0.
  if (typeof raw !== 'string' || !/^[0-9]+$/.test(raw.trim())) return NaN;
  return Number(raw.trim());
}
