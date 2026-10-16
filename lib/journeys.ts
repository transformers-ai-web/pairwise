import { problems } from './problems';
import { reportedProblems, type Company } from './reported-problems';
export { metaProblems } from './meta';
const names = { meta: 'Meta', google: 'Google', apple: 'Apple', amazon: 'Amazon', netflix: 'Netflix' };
function companyJourney<C extends Company>(id: C) {
  const bank = reportedProblems[id];
  return {
    title: 'The ' + names[id] + ' journey', kicker: 'CANDIDATE-REPORTED | ' + names[id].toUpperCase(),
    module: ('interview-' + id) as `interview-${C}`, localKey: 'pairwise-' + id + '-v1', problems: bank,
    description: bank.length + ' source-backed practice problems. Read the candidate evidence on each card; reported variations are labeled.',
    collectionNote: 'Each entry links to a first-person account identifying the company and question. Named problems, broader variations, and original reported tasks are distinguished. Original tasks link to the candidate prompt; their difficulty is editorial. These are historical, self-reported experiences, not independently verified interviews or frequency predictions. Missing dates are shown explicitly. Sources reviewed October 16, 2026. We add questions only when supporting evidence is available.',
  };
}
export const journeys = {
  foundations: {
    title: 'Interview foundations', kicker: 'THE ORIGINAL COLLECTION', module: 'interview',
    localKey: 'pairwise-preview-v1', problems,
    description: '32 problems in 16 cards, ordered Easy, Medium, then Hard. Build confidence with two problems of the same difficulty on every card.',
    collectionNote: '32 problems across core interview patterns. Foundations from LeetCode, plus practice drawn from reported Atlassian interviews. This is a starter set, not an official company question bank.',
  },
  meta: companyJourney('meta'), google: companyJourney('google'), apple: companyJourney('apple'), amazon: companyJourney('amazon'), netflix: companyJourney('netflix'),
} as const;
export type JourneyId = keyof typeof journeys;
export type Journey = typeof journeys[JourneyId];
export type InterviewModule = typeof journeys[JourneyId]['module'];
