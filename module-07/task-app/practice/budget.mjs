// Arithmetic exercise only. Rates are supplied by the caller, not fetched prices.
export function estimateTextCost({inputTokens,outputTokens,inputPerMillion,outputPerMillion,requests=1}) {
 for(const value of [inputTokens,outputTokens,inputPerMillion,outputPerMillion,requests])
  if(typeof value!=='number'||!Number.isFinite(value)||value<0)throw new Error('Use finite nonnegative numbers.');
 if(![inputTokens,outputTokens,requests].every(Number.isSafeInteger))throw new Error('Token counts and requests must be safe integers.');
 const perRequest=(inputTokens*inputPerMillion+outputTokens*outputPerMillion)/1_000_000;
 const total=perRequest*requests;
 if(!Number.isFinite(total))throw new Error('Estimate exceeded the supported numeric range.');
 return {perRequest,total};
}
