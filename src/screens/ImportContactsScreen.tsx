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
  const { events, addEvent, deleteEvent } = useEventContext();

  const [contacts, setContacts] = useState<ContactBirthday[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());
  const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Map contactId -> eventId (to delete by eventId)
  const importedEventByContact = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const e of events) {
      if (e.sourceContactId) map.set(e.sourceContactId, e.id);
    }
    return map;
  }, [events]);

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

    // Pre-select all non-imported contacts for import
    const alreadyImported = new Set(
      events.filter((e) => e.sourceContactId).map((e) => e.sourceContactId!),
    );
    const preAdd = new Set<string>();
    for (const c of result) {
      if (!alreadyImported.has(c.phoneContactId)) {
        preAdd.add(c.phoneContactId);
      }
    }
    setSelectedToAdd(preAdd);
    setSelectedToRemove(new Set());
    setLoading(false);
  }, [events]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const toggleContact = (id: string) => {
    const isImported = importedEventByContact.has(id);
    if (isImported) {
      setSelectedToRemove((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setSelectedToAdd((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  };

  const selectableContacts = contacts.filter(
    (c) => !importedEventByContact.has(c.phoneContactId),
  );

  const toggleAll = () => {
    if (selectedToAdd.size === selectableContacts.length) {
      setSelectedToAdd(new Set());
    } else {
      setSelectedToAdd(new Set(selectableContacts.map((c) => c.phoneContactId)));
    }
  };

  const runImport = async () => {
    const toImport = contacts.filter((c) => selectedToAdd.has(c.phoneContactId));
    if (toImport.length === 0) return;

    setWorking(true);
    const newEvents = contactsToEvents(
      toImport,
      DEFAULT_CATEGORIES[0].id,
      SOUNDS[0].id,
    );

    for (const event of newEvents) {
      await addEvent(event);
    }

    setWorking(false);
    setSelectedToAdd(new Set());

    Alert.alert(
      t('importContacts.done'),
      t('importContacts.importedCount', { count: newEvents.length }),
    );
  };

  const runRemove = () => {
    if (selectedToRemove.size === 0) return;
    Alert.alert(
      t('importContacts.removeConfirmTitle'),
      t('importContacts.removeConfirmMessage', { count: selectedToRemove.size }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setWorking(true);
            const ids = Array.from(selectedToRemove);
            for (const contactId of ids) {
              const eventId = importedEventByContact.get(contactId);
              if (eventId) await deleteEvent(eventId);
            }
            setWorking(false);
            setSelectedToRemove(new Set());
            Alert.alert(
              t('importContacts.removeDoneTitle'),
              t('importContacts.removeDoneMessage', { count: ids.length }),
            );
          },
        },
      ],
    );
  };

  const renderContact = ({ item }: { item: ContactBirthday }) => {
    const isImported = importedEventByContact.has(item.phoneContactId);
    const isSelectedAdd = selectedToAdd.has(item.phoneContactId);
    const isSelectedRemove = selectedToRemove.has(item.phoneContactId);

    let iconName: any;
    let iconColor: string;
    if (isImported && isSelectedRemove) {
      iconName = 'close-circle';
      iconColor = colors.error;
    } else if (isImported) {
      iconName = 'checkmark-circle';
      iconColor = colors.success;
    } else if (isSelectedAdd) {
      iconName = 'checkbox';
      iconColor = colors.primary;
    } else {
      iconName = 'square-outline';
      iconColor = colors.textTertiary;
    }

    const rowBg = isSelectedRemove
      ? colors.error + '15'
      : isImported
        ? colors.surfaceVariant
        : colors.surface;

    return (
      <TouchableOpacity
        style={[
          styles.contactRow,
          {
            backgroundColor: rowBg,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginBottom: spacing.xs,
          },
        ]}
        onPress={() => toggleContact(item.phoneContactId)}
      >
        <Ionicons name={iconName} size={24} color={iconColor} />
        <View style={{ flex: 1, marginLeft: spacing.sm, marginRight: spacing.sm }}>
          <Text style={[typo.body, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[typo.bodySmall, { color: colors.textSecondary }]}>
            {formatDate(new Date(item.birthday), 'dd MMMM', i18n.language)}
          </Text>
        </View>
        {isImported && (
          <Text
            style={[
              typo.bodySmall,
              {
                color: isSelectedRemove ? colors.error : colors.success,
                fontWeight: '600',
              },
            ]}
          >
            {isSelectedRemove
              ? t('importContacts.willRemove')
              : t('importContacts.alreadyImported')}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (permissionDenied) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <Ionicons name="lock-closed" size={48} color={colors.textTertiary} />
        <Text
          style={[
            typo.body,
            {
              color: colors.textSecondary,
              marginTop: spacing.md,
              textAlign: 'center',
              paddingHorizontal: spacing.xl,
            },
          ]}
        >
          {t('importContacts.permissionDenied')}
        </Text>
      </SafeAreaView>
    );
  }

  if (contacts.length === 0) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: colors.background }]}
        edges={['top']}
      >
        <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
        <Text
          style={[
            typo.body,
            {
              color: colors.textSecondary,
              marginTop: spacing.md,
              textAlign: 'center',
              paddingHorizontal: spacing.xl,
            },
          ]}
        >
          {t('importContacts.noContacts')}
        </Text>
      </SafeAreaView>
    );
  }

  const hasAdd = selectedToAdd.size > 0;
  const hasRemove = selectedToRemove.size > 0;
  const allSelected =
    selectableContacts.length > 0 && selectedToAdd.size === selectableContacts.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with count + select all */}
      <View style={[styles.headerRow, { padding: spacing.md }]}>
        <Text
          style={[typo.body, styles.headerText, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {t('importContacts.found', { count: contacts.length })}
        </Text>
        {selectableContacts.length > 0 && (
          <TouchableOpacity onPress={toggleAll} style={styles.headerAction}>
            <Text
              style={[typo.body, { color: colors.primary, fontWeight: '600' }]}
              numberOfLines={1}
            >
              {allSelected
                ? t('importContacts.deselectAll')
                : t('importContacts.selectAll')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tap-hint for removal */}
      <Text
        style={[
          typo.bodySmall,
          {
            color: colors.textTertiary,
            paddingHorizontal: spacing.md,
            marginBottom: spacing.xs,
          },
        ]}
      >
        {t('importContacts.tapImportedHint')}
      </Text>

      {/* Contact list */}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.phoneContactId}
        renderItem={renderContact}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 120 }}
      />

      {/* Bottom bar: import and/or remove */}
      {(hasAdd || hasRemove) && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.background,
              padding: spacing.md,
              borderTopColor: colors.border,
            },
          ]}
        >
          {hasRemove && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.error,
                  borderRadius: borderRadius.lg,
                  padding: spacing.md,
                  marginBottom: hasAdd ? spacing.sm : 0,
                },
              ]}
              onPress={runRemove}
              disabled={working}
            >
              {working ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="trash" size={20} color="#FFF" />
                  <Text
                    style={[
                      typo.body,
                      { color: '#FFF', fontWeight: '700', marginLeft: spacing.sm },
                    ]}
                  >
                    {t('importContacts.removeSelected', {
                      count: selectedToRemove.size,
                    })}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
          {hasAdd && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.primary,
                  borderRadius: borderRadius.lg,
                  padding: spacing.md,
                },
              ]}
              onPress={runImport}
              disabled={working}
            >
              {working ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="download" size={20} color="#FFF" />
                  <Text
                    style={[
                      typo.body,
                      { color: '#FFF', fontWeight: '700', marginLeft: spacing.sm },
                    ]}
                  >
                    {t('importContacts.importSelected', { count: selectedToAdd.size })}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: { flex: 1, marginRight: 12 },
  headerAction: { flexShrink: 0 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
