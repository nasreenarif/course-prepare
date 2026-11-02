import { createServer } from 'node:http';
// Disposable loopback-only demonstration. No MongoDB, .env, or external AI call.
import { createApp } from './app.js';
import { models } from './model-doubles.js';
import { hashPassword } from './passwords.js';
import { makeAIService } from './ai.js';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
if(process.env.NODE_ENV==='production')throw new Error('The memory demo cannot run as production.');
const data=models();
// Only this fictional loopback demo prints messages; Gmail mode never logs codes.
data.mailer.sendMail=async message=>console.log(`DEMO EMAIL to ${message.to}\n${message.subject}\n${message.text}`);
const passwordHash=await hashPassword('Local study passphrase 7!');
await data.User.create({email:'learner@example.test',passwordHash,emailVerifiedAt:new Date()});
const dist=fileURLToPath(new URL('../client/dist/',import.meta.url));
const port=Number(process.env.DEMO_PORT ?? 3000);
if(!Number.isInteger(port)||port<0||port>65535)throw new Error('DEMO_PORT must be a valid port (0 selects an available test port).');
let app;
export const server=createServer((req,res)=>app(req,res));
server.listen(port,'127.0.0.1',()=>{
  const origin=`http://localhost:${server.address().port}`;
  app=createApp({...data,secret:randomBytes(32).toString('hex'),dummyHash:passwordHash,
    appOrigin:origin,ai:makeAIService({mode:'mock'}),staticDir:existsSync(dist+'/index.html')?dist:undefined});
  console.log(`Disposable local demo: ${origin} (build client first). See README for the public practice account. Login codes appear only in this demo terminal.`);
});
process.on('SIGINT',()=>server.close());process.on('SIGTERM',()=>server.close());
