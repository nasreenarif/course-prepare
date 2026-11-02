import React, { useEffect, useRef, useState } from 'react';
import { api } from './api.js';
export function AIPlanner({mode,onDraft,onSessionFailure,disabled=false}) {
  const [goal,setGoal]=useState(''),[plan,setPlan]=useState(null),[message,setMessage]=useState('');
  const [busy,setBusy]=useState(false),[fieldError,setFieldError]=useState('');
  const lock=useRef(false),controller=useRef(null),generation=useRef(0),input=useRef(null);
  useEffect(()=>()=>{generation.current++;controller.current?.abort();},[]);
  function cancel() {
    generation.current++;controller.current?.abort();lock.current=false;setBusy(false);
    requestAnimationFrame(()=>input.current?.focus());
    setMessage('Stopped waiting. The provider may still finish or charge for a live request.');
  }
  async function submit(event) {
    event.preventDefault();if(lock.current)return;
    setFieldError('');setMessage('');setPlan(null);
    if(!goal.trim()||goal.length>1000){setFieldError('Enter a goal of 1–1000 characters.');input.current.focus();return;}
    lock.current=true;setBusy(true);const run=++generation.current;controller.current=new AbortController();
    try {
      const data=await api('/ai/plans',{method:'POST',body:{goal},signal:controller.current.signal,timeoutMs:25000});
      if(run!==generation.current)return;
      setPlan(data.plan);setMessage(data.mode==='mock'?'Mock draft ready. No model was called.':'Gemini draft ready. Review before using it.');
    } catch(error) {
      if(run!==generation.current)return;
      setMessage(error.code==='TIMEOUT'||error.code==='NETWORK_ERROR'?'No draft received. The provider may still finish; wait before trying again.':error.message);
      if(error.status===401)onSessionFailure(error);
    } finally {if(run===generation.current){lock.current=false;setBusy(false);}}
  }
  return <section className="lab-section" aria-labelledby="ai-title"><h2 id="ai-title">Task planning assistant</h2>
    <p>{mode==='mock'?'Local mock mode: fixed practice suggestions; no external AI service.':mode==='live'?'Live Gemini mode: your goal is sent to Google Gemini.':'AI is disabled. Use the manual task form.'}</p>
    <p>The assistant receives only the goal you enter, not your stored tasks. Do not enter private data or secrets. It cannot save or execute anything.</p>
    {mode!=='off'&&<form onSubmit={submit} noValidate>
      <label htmlFor="ai-goal">Project goal</label><p id="ai-help">Use 1–1000 characters. Request small tasks, not a finished milestone submission.</p>
      <textarea ref={input} id="ai-goal" rows={3} value={goal} readOnly={busy} aria-invalid={Boolean(fieldError)} aria-describedby={`ai-help${fieldError?' ai-error':''}`}
        onChange={e=>{setGoal(e.target.value);setFieldError('');setPlan(null);setMessage('');}}/>
      {fieldError&&<p id="ai-error" className="error">{fieldError}</p>}
      <button type="submit" aria-disabled={busy}> {busy?'Generating draft…':'Generate draft'} </button>
      {busy&&<button type="button" onClick={cancel}>Stop waiting</button>}
    </form>}
    <p role="status">{busy?'Generating draft. No tasks will be saved automatically.':message}</p>
    {plan&&<div><h3>Suggested plan — review required</h3><p>Use draft replaces the unsaved title in Add a task. It does not save a task.</p><p>{plan.summary}</p><ol>{plan.steps.map((step,index)=><li key={index}>
      <h4>{step.title}</h4><p>{step.reason}</p><button type="button" disabled={disabled} onClick={()=>{if(disabled)return;onDraft(step.title);setMessage('Suggestion copied to the manual task form. Edit it, then choose Add task to save.');}}>Use draft {index+1}</button>
    </li>)}</ol></div>}
  </section>;
}
