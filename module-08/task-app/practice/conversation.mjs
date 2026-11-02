// Optional validation exercise; the Task Planner route does not accept history.
export function boundedHistory(value) {
 if(!Array.isArray(value)||value.length<1||value.length>6)throw new Error('Use 1–6 turns.');
 let total=0;
 const turns=value.map((turn,index)=>{
  const expected=index%2===0?'user':'assistant';
  if(!turn||Object.keys(turn).some(key=>!['role','content'].includes(key))||turn.role!==expected
    ||typeof turn.content!=='string'||!turn.content.trim()||turn.content.length>1000)throw new Error('Invalid conversation turn.');
  total+=turn.content.length;return {role:turn.role,content:turn.content.trim()};
 });
 if(turns.at(-1).role!=='user'||total>3000)throw new Error('End with a user turn; keep total content at most 3000 characters.');
 return turns;
}
