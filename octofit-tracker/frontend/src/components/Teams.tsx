import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Team = {
  name: string;
  members?: unknown[];
};

export default function Teams() {
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => {
        if (!active) return;
        setTeams(Array.isArray(data.teams) ? data.teams : []);
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
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        {error && <p role="alert" className="text-danger">Unable to load data: {error}</p>}
        {!error && teams === null && <p role="status">Loading teams...</p>}
        {!error && teams !== null && teams.length === 0 && <p>No teams available.</p>}
        {!error && teams !== null && teams.length > 0 && (
          <ul className="list-unstyled">
            {teams.map((team, index) => (
              <li className="mb-2" key={index}>
                {String(team.name)} - {Array.isArray(team.members) ? team.members.join(', ') : 'No members'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
