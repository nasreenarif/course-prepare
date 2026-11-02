// Optional LIVE check: one fictional request to Gemini; may consume quota or cost money.
// Run only when ready: npm run gemini:smoke (from this server directory).
import { aiSettings, makeAIService, PROMPT_VERSION } from './ai.js';
try {
  const settings = aiSettings();
  if (settings.mode !== 'live') throw new Error('Set AI_MODE=live in server/.env for this live check. Use lab:provider for offline practice.');
  const plan = await makeAIService(settings).generate('Plan a small fictional study checklist app.');
  console.log(`Gemini live check passed: model=${settings.model}, prompt=${PROMPT_VERSION}, acceptedSteps=${plan.steps.length}.`);
  console.log('No database records were created. Now test the signed-in browser flow.');
} catch (error) {
  // The adapter exposes only safe errors. Do not log environment values or provider bodies.
  console.error(`Gemini check failed${error.code ? ` (${error.code})` : ''}: ${error.message}`);
  process.exitCode = 1;
}
