import {estimateTextCost} from './budget.mjs';
// Made-up unit rates for teaching arithmetic, NOT a model price quotation.
const estimate=estimateTextCost({inputTokens:800,outputTokens:300,inputPerMillion:2,outputPerMillion:8,requests:100});
console.log('HYPOTHETICAL rates only; currency must match both supplied rates.');
console.log(`Per request: ${estimate.perRequest.toFixed(4)}; 100 requests: ${estimate.total.toFixed(2)}`);
console.log('Expected arithmetic: 0.0040 per request and 0.40 for 100. Not a spending cap.');
