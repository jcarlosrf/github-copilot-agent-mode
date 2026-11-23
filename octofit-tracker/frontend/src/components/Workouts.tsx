import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Suggestion = {
  title: string;
  reason?: string;
};

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getJson<{ suggestions: Suggestion[] }>('/api/workouts/suggestions/mona%40example.com')
      .then((data) => {
        if (!active) return;
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : 'Unable to load data');
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {error && <p role="alert" className="text-danger">Unable to load data: {error}</p>}
        {!error && suggestions === null && <p role="status">Loading workout suggestions...</p>}
        {!error && suggestions !== null && suggestions.length === 0 && <p>No workout suggestions available.</p>}
        {!error && suggestions !== null && suggestions.length > 0 && (
          <ul className="list-unstyled">
            {suggestions.map((item, index) => (
              <li className="mb-2" key={index}>
                <strong>{String(item.title)}</strong>{item.reason ? <> - {String(item.reason)}</> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
