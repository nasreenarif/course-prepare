import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { TextField } from './TextField.jsx';
import { contrastRatio, allowedResourceUrl } from './study-tools.js';
import './style.css';
function StudyLab() {
  const [owner,setOwner]=useState(''),[project,setProject]=useState('');
  const [submitted,setSubmitted]=useState(false),[saved,setSaved]=useState('');
  const ownerRef=useRef(null),projectRef=useRef(null),summary=useRef(null);
  const ownerError=submitted && !owner.trim() ? 'Enter an owner name.' : '';
  const projectError=submitted && !project.trim() ? 'Enter a project name.' : '';
  const [foreground,setForeground]=useState('#174ca1'),[background,setBackground]=useState('#ffffff');
  let contrast;
  try { const ratio=contrastRatio(foreground,background); contrast=`${ratio.toFixed(2)}:1 — ${ratio >= 4.5 ? 'meets' : 'below'} the ordinary-text 4.5:1 threshold.`; }
  catch(error) { contrast=error.message; }
  const [resource,setResource]=useState('https://example.com/help');
  const url=allowedResourceUrl(resource);
  function submit(event) {
    event.preventDefault();setSubmitted(true);setSaved('');
    if (!owner.trim() || !project.trim()) { requestAnimationFrame(()=>summary.current?.focus());return; }
    setSaved(`Local preview saved for ${owner.trim()}: ${project.trim()}. No server request was made.`);
  }
  return <><a className="skip-link" href="#lab-main">Skip to lab</a><main id="lab-main" tabIndex={-1}>
    <h1>Module 6 self-study lab</h1><p>This optional local lab does not need MongoDB, accounts, or Google. It stores nothing permanently. Refreshing clears the practice values.</p>
    <section className="lab-section" aria-labelledby="form-heading"><h2 id="form-heading">1. Reusable fields and an error summary</h2>
      <p>Submit both fields empty. Expect a focused summary with two corrections. Choose a correction to focus its input, enter both values, and submit again.</p>
      <form onSubmit={submit} noValidate>
        {(ownerError || projectError) && <section className="error-summary" ref={summary} tabIndex={-1} aria-labelledby="summary-title">
          <h3 id="summary-title">Correct the following fields</h3><ul>
            {ownerError && <li><button type="button" onClick={()=>ownerRef.current?.focus()}>Owner name: {ownerError}</button></li>}
            {projectError && <li><button type="button" onClick={()=>projectRef.current?.focus()}>Project name: {projectError}</button></li>}
          </ul></section>}
        <TextField label="Owner name" name="owner" value={owner} onChange={setOwner} help="Use a fictional name." error={ownerError} inputRef={ownerRef}/>
        <TextField label="Project name" name="project" value={project} onChange={setProject} help="Use a short practice project name." error={projectError} inputRef={projectRef}/>
        <button type="submit">Save local preview</button>
      </form><p role="status">{saved}</p>
    </section>
    <section className="lab-section" aria-labelledby="contrast-heading"><h2 id="contrast-heading">2. Calculate a contrast ratio</h2>
      <p>Compare #174ca1 and #777777 on #ffffff. This calculator accepts opaque six-digit sRGB hex colors only; it does not model transparency or gradients.</p>
      <label htmlFor="foreground">Foreground hex color</label><input id="foreground" aria-invalid={!/^#[0-9a-f]{6}$/i.test(foreground)} aria-describedby="contrast-result" value={foreground} onChange={e=>setForeground(e.target.value)}/>
      <label htmlFor="background">Background hex color</label><input id="background" aria-invalid={!/^#[0-9a-f]{6}$/i.test(background)} aria-describedby="contrast-result" value={background} onChange={e=>setBackground(e.target.value)}/>
      <p id="contrast-result">{contrast}</p><p>The threshold decision uses the unrounded ratio. A rounded 4.50 display can conceal a value below 4.5.</p>
    </section>
    <section className="lab-section" aria-labelledby="table-heading"><h2 id="table-heading">3. Scroll a real data table</h2>
      <p id="table-help">At a narrow width, focus the table region and use horizontal arrow keys to inspect its columns. The rest of the page should stay within the viewport.</p>
      <div className="table-scroll" role="region" aria-labelledby="table-caption" aria-describedby="table-help" tabIndex={0}>
        <table className="lab-table"><caption id="table-caption">Fictional project review results</caption><thead><tr>
          <th scope="col">Project</th><th scope="col">Keyboard journey</th><th scope="col">Narrow layout</th><th scope="col">Next action</th>
        </tr></thead><tbody><tr><th scope="row">Task organizer</th><td>Passed local check</td><td>Long title wraps</td><td>Test a screen reader</td></tr>
          <tr><th scope="row">Reading journal</th><td>Focus defect found</td><td>Retest pending</td><td>Restore focus after deletion</td></tr></tbody></table>
      </div>
    </section>
    <section className="lab-section" aria-labelledby="image-heading"><h2 id="image-heading">4. Explain an informative image</h2>
      <figure><img className="lab-image" src="/study-progress.svg" alt="Four of six practice checks completed" width="360" height="120"/>
        <figcaption>Practice progress is fictional. Two checks still need attention; color is accompanied by text.</figcaption></figure>
    </section>
    <section className="lab-section" aria-labelledby="url-heading"><h2 id="url-heading">5. Validate a resource URL</h2>
      <p>Try https://example.com/help, /relative, and javascript:alert(1). The value is parsed and shown as text; this lab never visits it or executes it.</p>
      <label htmlFor="resource">Resource URL to examine</label><input id="resource" aria-invalid={!url} aria-describedby="url-result" value={resource} onChange={e=>setResource(e.target.value)}/>
      <p id="url-result">{url ? `Accepted by this HTTPS-only policy: ${url}` : 'Rejected by this HTTPS-only policy.'}</p>
      <p>Acceptance does not establish that a destination is trustworthy. A product can add an exact hostname allowlist.</p>
    </section>
  </main></>;
}
createRoot(document.getElementById('root')).render(<StudyLab/>);
