// This module contains no secrets and is safe to import on either side.
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const keys = (value, allowed) => Object.keys(value).every(key => allowed.includes(key));
const bounded = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
export function validPlan(value) {
  return object(value) && keys(value,['summary','steps']) && bounded(value.summary,600)
    && Array.isArray(value.steps) && value.steps.length >= 1 && value.steps.length <= 5
    && value.steps.every(step => object(step) && keys(step,['title','reason'])
      && bounded(step.title,200) && bounded(step.reason,500));
}
export const planSchema = {
  type:'object', additionalProperties:false, required:['summary','steps'],
  properties:{
    summary:{type:'string'},
    steps:{type:'array',items:{
      type:'object',additionalProperties:false,required:['title','reason'],
      properties:{title:{type:'string'},reason:{type:'string'}}
    }}
  }
};
