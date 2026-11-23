import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Activity = {
  type: string;
  minutes: number;
  points: number;
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getJson<{ activities: Activity[] }>('/api/activities')
      .then((data) => {
        if (!active) return;
        setActivities(Array.isArray(data.activities) ? data.activities : []);
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
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        {error && <p role="alert" className="text-danger">Unable to load data: {error}</p>}
        {!error && activities === null && <p role="status">Loading activities...</p>}
        {!error && activities !== null && activities.length === 0 && <p>No activities yet.</p>}
        {!error && activities !== null && activities.length > 0 && (
          <ul className="list-unstyled">
            {activities.map((activity, index) => (
              <li className="mb-2" key={index}>
                {String(activity.type)} - {String(activity.minutes)} minutes - {String(activity.points)} points
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
