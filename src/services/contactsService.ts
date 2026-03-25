import * as Contacts from 'expo-contacts';
import { SEvent, Reminder } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export interface ContactBirthday {
  name: string;
  birthday: string; // ISO "YYYY-MM-DD"
  phoneContactId: string;
}

/**
 * Request permission to access device contacts.
 */
export async function requestContactsPermission(): Promise<boolean> {
  const { status: existing } = await Contacts.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Contacts.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Fetch all contacts that have a birthday field set.
 */
export async function getContactsWithBirthdays(): Promise<ContactBirthday[]> {
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.Birthday, Contacts.Fields.Name],
  });

  const results: ContactBirthday[] = [];

  for (const contact of data) {
    if (!contact.birthday || !contact.name) continue;

    const { year, month, day } = contact.birthday;
    // month is 0-indexed in expo-contacts
    const m = String((month ?? 0) + 1).padStart(2, '0');
    const d = String(day ?? 1).padStart(2, '0');
    const y = year ?? 2000; // Default year if not set

    results.push({
      name: contact.name,
      birthday: `${y}-${m}-${d}`,
      phoneContactId: contact.id ?? uuidv4(),
    });
  }

  return results.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Convert selected contacts into SEvent objects ready to be saved.
 */
export function contactsToEvents(
  contacts: ContactBirthday[],
  categoryId: string,
  soundId: string,
): SEvent[] {
  const now = new Date().toISOString();

  return contacts.map((contact) => {
    const reminder: Reminder = {
      id: uuidv4(),
      daysBefore: 1,
      time: '09:00',
    };

    return {
      id: uuidv4(),
      title: contact.name,
      description: '',
      eventType: 'ricorrenza' as const,
      date: contact.birthday,
      recurrence: { type: 'yearly' as const },
      categoryId,
      reminders: [reminder],
      soundId,
      sourceContactId: contact.phoneContactId,
      createdAt: now,
      updatedAt: now,
    };
  });
}
