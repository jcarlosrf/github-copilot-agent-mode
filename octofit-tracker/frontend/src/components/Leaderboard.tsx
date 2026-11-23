import { CapabilityCard } from './CapabilityCard.js';
export default function Leaderboard() {
  return <CapabilityCard
    title="Leaderboard"
    description="Compare team point totals."
    endpoint="/api/leaderboard"
    dataKey="leaderboard"
    emptyText="No leaderboard rankings or scores yet."
    renderItem={(item) => <>#{String(item.rank)} {String(item.teamName)} - {String(item.totalPoints)} points</>}
  />;
}
