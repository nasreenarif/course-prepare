// Run from task-app: node practice/password-demo.mjs
import { hashPassword, verifyPassword } from '../server/passwords.js';
const password = 'A long practice passphrase';
const first = await hashPassword(password);
const second = await hashPassword(password);
console.log('Different stored values:', first !== second);
console.log('Correct password:', await verifyPassword(password, first));
console.log('Wrong password:', await verifyPassword('A wrong practice passphrase', first));
