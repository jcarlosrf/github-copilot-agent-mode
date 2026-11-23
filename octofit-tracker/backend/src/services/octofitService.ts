import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw badRequest('Activity details are required');
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' ||
    typeof teamId !== 'string' ||
    typeof type !== 'string' ||
    !type.trim() ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes <= 0
  ) {
    throw badRequest('Valid user, team, type, and minutes are required');
  }
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(teamId)) {
    throw badRequest('User and team IDs must be valid');
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!user || !team) throw badRequest('User and team must exist');

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw badRequest('Team details are required');
  }

  const { name, mascot, members } = input as Record<string, unknown>;
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof mascot !== 'string' ||
    !mascot.trim()
  ) {
    throw badRequest('Team name and mascot are required');
  }
  if (
    members !== undefined &&
    (!Array.isArray(members) || members.some((memberId) => typeof memberId !== 'string' || !Types.ObjectId.isValid(memberId)))
  ) {
    throw badRequest('Team members must be valid user IDs');
  }

  const memberIds = (members ?? []) as string[];
  const uniqueMemberIds = [...new Set(memberIds)];
  if (uniqueMemberIds.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: uniqueMemberIds } });
    if (existingMembers !== uniqueMemberIds.length) {
      throw badRequest('Team members must exist');
    }
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1 } },
  ]);
  const teams = await Team.find({ _id: { $in: totals.map(({ _id }) => _id) } })
    .select('_id name')
    .lean();
  const teamNames = new Map(teams.map((team) => [team._id.toString(), team.name]));
  const standings = totals
    .map(({ _id, totalPoints }) => ({ teamName: teamNames.get(_id.toString()), totalPoints }))
    .filter((entry): entry is { teamName: string; totalPoints: number } => Boolean(entry.teamName));

  return standings.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw badRequest('User not found');

  const [activity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).select('type').lean(),
    Workout.find({ focus: user.fitnessGoal }).sort({ title: 1 }).lean(),
  ]);
  const reason = activity
    ? `Recommended for your ${user.fitnessGoal} goal and recent ${activity.type} activity.`
    : `Recommended for your ${user.fitnessGoal} fitness goal.`;

  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
