import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useEventContext } from '../context/EventContext';
import {
  ContactBirthday,
  requestContactsPermission,
  getContactsWithBirthdays,
  contactsToEvents,
} from '../services/contactsService';
import { DEFAULT_CATEGORIES, SOUNDS } from '../utils/constants';
import { formatDate } from '../utils/dateUtils';

export function ImportContactsScreen() {
  const { t, i18n } = useTranslation();
  const { colors, typography: typo, spacing, borderRadius } = useTheme();
  const { events, addEvent } = useEventContext();

  const [contacts, setContacts] = useState<ContactBirthday[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Contact IDs already imported
  const importedIds = new Set(
    events.filter((e) => e.sourceContactId).map((e) => e.sourceContactId!)
  );

  const loadContacts = useCallback(async () => {
    setLoading(true);
    const granted = await requestContactsPermission();
    if (!granted) {
      setPermissionDenied(true);
      setLoading(false);
      return;
    }

    const result = await getContactsWithBirthdays();
    setContacts(result);

    // Pre-select all non-imported contacts
    const newSelected = new Set<string>();
    for (const c of result) {
      if (!importedIds.has(c.phoneContactId)) {
        newSelected.add(c.phoneContactId);
      }
    }
    setSelected(newSelected);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const toggleContact = (id: string) => {
    if (importedIds.has(id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectableContacts = contacts.filter((c) => !importedIds.has(c.phoneContactId));

  const toggleAll = () => {
    if (selected.size === selectableContacts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(selectableContacts.map((c) => c.phoneContactId)));
    }
  };

  const handleImport = async () => {
    const toImport = contacts.filter((c) => selected.has(c.phoneContactId));
    if (toImport.length === 0) return;

    setImporting(true);
    const newEvents = contactsToEvents(
      toImport,
      DEFAULT_CATEGORIES[0].id, // Family category
      SOUNDS[0].id, // Default sound
    );

    for (const event of newEvents) {
      await addEvent(event);
    }

    setImporting(false);
    setSelected(new Set());

    Alert.alert(
      t('importContacts.done'),
      t('importContacts.importedCount', { count: newEvents.length }),
    );
  };

  const renderContact = ({ item }: { item: ContactBirthday }) => {
    const isImported = importedIds.has(item.phoneContactId);
    const isSelected = selected.has(item.phoneContactId);

    return (
      <TouchableOpacity
        style={[
          styles.contactRow,
          {
            backgroundColor: isImported ? colors.surfaceVariant : colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginBottom: spacing.xs,
            opacity: isImported ? 0.5 : 1,
          },
        ]}
        onPress={() => toggleContact(item.phoneContactId)}
        disabled={isImported}
      >
        <Ionicons
          name={isImported ? 'checkmark-circle' : isSelected ? 'checkbox' : 'square-outline'}
          size={24}
          color={isImported ? colors.success : isSelected ? colors.primary : colors.textTertiary}
        />
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={[typo.body, { color: colors.text }]}>{item.name}</Text>
          <Text style={[typo.bodySmall, { color: colors.textSecondary }]}>
            {formatDate(new Date(item.birthday), 'dd MMMM', i18n.language)}
          </Text>
        </View>
        {isImported && (
          <Text style={[typo.bodySmall, { color: colors.success }]}>
            {t('importContacts.alreadyImported')}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (permissionDenied) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]} edges={['top']}>
        <Ionicons name="lock-closed" size={48} color={colors.textTertiary} />
        <Text style={[typo.body, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center', paddingHorizontal: spacing.xl }]}>
          {t('importContacts.permissionDenied')}
        </Text>
      </SafeAreaView>
    );
  }

  if (contacts.length === 0) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]} edges={['top']}>
        <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
        <Text style={[typo.body, { color: colors.textSecondary, marginTop: spacing.md, textAlign: 'center', paddingHorizontal: spacing.xl }]}>
          {t('importContacts.noContacts')}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with select all */}
      <View style={[styles.headerRow, { padding: spacing.md }]}>
        <Text style={[typo.body, { color: colors.textSecondary }]}>
          {t('importContacts.found', { count: contacts.length })}
        </Text>
        <TouchableOpacity onPress={toggleAll}>
          <Text style={[typo.body, { color: colors.primary, fontWeight: '600' }]}>
            {selected.size === selectableContacts.length
              ? t('importContacts.deselectAll')
              : t('importContacts.selectAll')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contact list */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.phoneContactId}
        renderItem={renderContact}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 100 }}
      />

      {/* Import button */}
      {selected.size > 0 && (
        <View style={[styles.bottomBar, { backgroundColor: colors.background, padding: spacing.md, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.importButton,
              { backgroundColor: colors.primary, borderRadius: borderRadius.lg, padding: spacing.md },
            ]}
            onPress={handleImport}
            disabled={importing}
          >
            {importing ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="download" size={20} color="#FFF" />
                <Text style={[typo.body, { color: '#FFF', fontWeight: '700', marginLeft: spacing.sm }]}>
                  {t('importContacts.importSelected', { count: selected.size })}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1 },
  importButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
