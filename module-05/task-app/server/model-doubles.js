// Controlled test/demo data only. The normal server uses models.js and MongoDB.
export function models() {
  let next = 1;
  const users = [], tasks = [];
  const id = () => (next++).toString(16).padStart(24, '0');
  const equal = (left, right) => right === null ? left == null : String(left) === String(right);
  const match = (item, filter) => Object.entries(filter).every(([key, value]) => {
    if (key === '$or') return value.some(part => match(item, part));
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      return Object.entries(value).every(([op, expected]) => {
        if (op === '$ne') return !equal(item[key], expected);
        if (op === '$lt') return item[key] < expected;
        if (op === '$lte') return item[key] <= expected;
        if (op === '$gt') return item[key] > expected;
        throw new Error(`Unsupported fixture operator: ${op}`);
      });
    }
    return equal(item[key], value);
  });
  const update = (item, change) => {
    Object.assign(item, change.$set || {});
    for (const key of Object.keys(change.$unset || {})) delete item[key];
    for (const [key, amount] of Object.entries(change.$inc || {})) item[key] = (item[key] || 0) + amount;
  };
  const copy = value => value ? structuredClone(value) : null;
  // Query operations execute atomically within this process, not against a database.
  const query = operation => ({
    select() { return Promise.resolve().then(operation); },
    then(resolve, reject) { return Promise.resolve().then(operation).then(resolve, reject); }
  });
  const mailer = { messages: [], async sendMail(message) { this.messages.push({ ...message }); } };
  return {
    mailer,
    User: {
      async create(values) {
        if (users.some(user => user.email === values.email)) throw Object.assign(new Error('duplicate'), { code: 11000 });
        const user = { emailVerifiedAt: null, ...values, _id: id() }; users.push(user); return copy(user);
      },
      findOne(filter) { return query(() => copy(users.find(user => match(user, filter)))); },
      async findById(value) { return copy(users.find(user => String(user._id) === String(value))); },
      findOneAndUpdate(filter, change) {
        return query(() => { const user = users.find(item => match(item, filter)); if (user) update(user, change); return copy(user); });
      },
      async updateOne(filter, change) {
        const user = users.find(item => match(item, filter)); if (user) update(user, change);
        return { matchedCount: user ? 1 : 0, modifiedCount: user ? 1 : 0 };
      }
    },
    Task: {
      async create(values) { const task = { ...values, completed: values.completed ?? false, _id: id() }; tasks.push(task); return copy(task); },
      find(filter) { return { sort() { return { async limit(count) { return tasks.filter(task => match(task, filter)).slice(0, count).map(copy); } }; } }; },
      async findOne(filter) { return copy(tasks.find(task => match(task, filter))); },
      async findOneAndUpdate(filter, change) { const task = tasks.find(item => match(item, filter)); if (task) update(task, change); return copy(task); },
      async findOneAndDelete(filter) { const index = tasks.findIndex(task => match(task, filter)); return index < 0 ? null : tasks.splice(index, 1)[0]; }
    }
  };
}
