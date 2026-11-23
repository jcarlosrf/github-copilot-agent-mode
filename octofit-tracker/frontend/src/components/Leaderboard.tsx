import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Ranking = {
  rank: number;
  teamName: string;
  totalPoints: number;
};

export default function Leaderboard() {
  const [rankings, setRankings] = useState<Ranking[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getJson<{ leaderboard: Ranking[] }>('/api/leaderboard')
      .then((data) => {
        if (!active) return;
        setRankings(Array.isArray(data.leaderboard) ? data.leaderboard : []);
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
        <h2 className="h4">Leaderboard</h2>
        <p>Compare team point totals.</p>
        {error && <p role="alert" className="text-danger">Unable to load data: {error}</p>}
        {!error && rankings === null && <p role="status">Loading leaderboard...</p>}
        {!error && rankings !== null && rankings.length === 0 && <p>No leaderboard rankings or scores yet.</p>}
        {!error && rankings !== null && rankings.length > 0 && (
          <ul className="list-unstyled">
            {rankings.map((item, index) => (
              <li className="mb-2" key={index}>
                #{String(item.rank)} {String(item.teamName)} - {String(item.totalPoints)} points
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
