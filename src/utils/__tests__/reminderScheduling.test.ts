// Unit tests for the pure scheduling logic.
// Run with Jest once test infra is wired up.
// Manual test via: npx ts-node src/utils/__tests__/reminderScheduling.test.ts
import { computeReminderTriggers, MAX_REPEATS_PER_REMINDER } from '../reminderScheduling';
import { Reminder, SEvent } from '../../models/types';

function makeEvent(overrides: Partial<SEvent> = {}): SEvent {
  return {
    id: 'e1',
    title: 'Bolletta',
    description: '',
    eventType: 'scadenza',
    date: '2026-04-21',
    recurrence: { type: 'none' },
    categoryId: 'cat-bills',
    reminders: [],
    soundId: 'gentle-bell',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

type Case = { name: string; run: () => void };

const cases: Case[] = [
  {
    name: 'no repeat → exactly 1 trigger',
    run: () => {
      const reminder: Reminder = { id: 'r1', daysBefore: 0, time: '10:00' };
      const event = makeEvent();
      const occurrence = new Date('2026-04-21T00:00:00');
      const now = new Date('2026-04-21T08:00:00');
      const out = computeReminderTriggers(reminder, event, occurrence, now);
      assert(out.length === 1, `expected 1, got ${out.length}`);
      assert(out[0].isRepeat === false, 'first should not be repeat');
    },
  },
  {
    name: 'repeat 2h from 10:00 → 7 triggers (10,12,14,16,18,20,22)',
    run: () => {
      const reminder: Reminder = {
        id: 'r2',
        daysBefore: 0,
        time: '10:00',
        repeatEnabled: true,
        repeatIntervalHours: 2,
      };
      const event = makeEvent();
      const occurrence = new Date('2026-04-21T00:00:00');
      const now = new Date('2026-04-21T08:00:00');
      const out = computeReminderTriggers(reminder, event, occurrence, now);
      assert(out.length === 7, `expected 7, got ${out.length}`);
      assert(out[0].isRepeat === false, 'first is primary');
      assert(out.slice(1).every((t) => t.isRepeat), 'rest are repeats');
      const hours = out.map((t) => t.date.getHours());
      const expected = [10, 12, 14, 16, 18, 20, 22];
      assert(JSON.stringify(hours) === JSON.stringify(expected), `hours: ${hours}`);
    },
  },
  {
    name: 'repeat 1h capped at MAX_REPEATS_PER_REMINDER',
    run: () => {
      const reminder: Reminder = {
        id: 'r3',
        daysBefore: 0,
        time: '08:00',
        repeatEnabled: true,
        repeatIntervalHours: 1,
      };
      const event = makeEvent();
      const occurrence = new Date('2026-04-21T00:00:00');
      const now = new Date('2026-04-21T07:00:00');
      const out = computeReminderTriggers(reminder, event, occurrence, now);
      // Primary + max 12 repeats = 13 max
      assert(out.length <= 1 + MAX_REPEATS_PER_REMINDER, `got ${out.length}`);
    },
  },
  {
    name: 'past triggers filtered out',
    run: () => {
      const reminder: Reminder = {
        id: 'r4',
        daysBefore: 0,
        time: '10:00',
        repeatEnabled: true,
        repeatIntervalHours: 2,
      };
      const event = makeEvent();
      const occurrence = new Date('2026-04-21T00:00:00');
      const now = new Date('2026-04-21T15:00:00'); // already past 14:00
      const out = computeReminderTriggers(reminder, event, occurrence, now);
      // Only 16, 18, 20, 22 remain (primary 10, and 12/14 are past)
      assert(out.length === 4, `expected 4, got ${out.length}`);
      assert(out.every((t) => t.date.getTime() > now.getTime()), 'all future');
    },
  },
  {
    name: 'invalid time string → 0 triggers',
    run: () => {
      const reminder: Reminder = { id: 'r5', daysBefore: 0, time: 'invalid' };
      const event = makeEvent();
      const occurrence = new Date('2026-04-21T00:00:00');
      const now = new Date('2026-04-21T08:00:00');
      const out = computeReminderTriggers(reminder, event, occurrence, now);
      assert(out.length === 0, `expected 0, got ${out.length}`);
    },
  },
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

// Jest-compatible export (optional)
export { cases };

// Standalone runner
if (typeof require !== 'undefined' && require.main === module) {
  let ok = 0;
  let fail = 0;
  for (const c of cases) {
    try {
      c.run();
      console.log(`  ok   ${c.name}`);
      ok++;
    } catch (e) {
      console.log(`  FAIL ${c.name}: ${(e as Error).message}`);
      fail++;
    }
  }
  console.log(`\n${ok} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}
