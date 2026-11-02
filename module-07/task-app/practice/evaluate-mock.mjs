import {readFile} from 'node:fs/promises';
import {mockPlan} from '../server/ai.js';import {validPlan} from '../shared/plan.js';
const cases=JSON.parse(await readFile(new URL('./evaluation-cases.json',import.meta.url),'utf8'));
for(const item of cases){if(!validPlan(mockPlan(item.goal)))throw new Error(`Contract failure: ${item.id}`);console.log(`${item.id}: mock contract passed; live quality review NOT performed.`);}
