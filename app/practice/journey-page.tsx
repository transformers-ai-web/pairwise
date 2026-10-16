import { journeys, type JourneyId } from '@/lib/journeys';
import PracticeClient from './practice-client';

// Resolve the journey on the server and send one consistent snapshot to the client.
export default function JourneyPage({ journeyId }: { journeyId: JourneyId }) {
  return <PracticeClient key={journeyId} journeyId={journeyId} journey={journeys[journeyId]}/>;
}
