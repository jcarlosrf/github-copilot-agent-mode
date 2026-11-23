import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Props = {
  title: string;
  description: string;
  endpoint: string;
  dataKey: string;
  emptyText: string;
  renderItem: (item: Record<string, unknown>) => React.ReactNode;
};

export function CapabilityCard({ title, description, endpoint, dataKey, emptyText, renderItem }: Props) {
  const [items, setItems] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getJson<Record<string, unknown>>(endpoint)
      .then((data) => {
        if (!active) return;
        const result = data[dataKey];
        setItems(Array.isArray(result) ? result as Record<string, unknown>[] : []);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : 'Unable to load data');
      });

    return () => {
      active = false;
    };
  }, [endpoint, dataKey]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error && <p role="alert" className="text-danger">Unable to load data: {error}</p>}
        {!error && items === null && <p role="status">Loading {title.toLowerCase()}...</p>}
        {!error && items !== null && items.length === 0 && <p>{emptyText}</p>}
        {!error && items !== null && items.length > 0 && (
          <ul className="list-unstyled">
            {items.map((item, index) => <li className="mb-2" key={index}>{renderItem(item)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
