import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
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
  const [recentlyRemoved, setRecentlyRemoved] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Keep a stable ref to events so loadContacts doesn't need events as dep
  // (avoids re-fetching the whole contact list on every addEvent call)
  const eventsRef = useRef(events);
  useEffect(() => { eventsRef.current = events; }, [events]);

  const recentlyRemovedRef = useRef(recentlyRemoved);
  useEffect(() => { recentlyRemovedRef.current = recentlyRemoved; }, [recentlyRemoved]);

  // Map contactId -> eventId (to delete by eventId)
  const importedEventByContact = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const e of events) {
      if (e.sourceContactId) map.set(e.sourceContactId, e.id);
    }
    return map;
  }, [events]);

  // Stable fetch — does NOT re-run on every event change.
  // Reads latest events and recentlyRemoved via refs at call time.
  const loadContacts = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setLoading(true);
    try {
      const granted = await requestContactsPermission();
      if (!granted) {
        setPermissionDenied(true);
        return;
      }

      const result = await getContactsWithBirthdays();
      setContacts(result);
      // Don't pre-select anything: with thousands of contacts the user
      // would have to deselect manually. They explicitly tap to add.
      setSelectedToAdd(new Set());
      setSelectedToRemove(new Set());
    } catch {
      // keep whatever was shown before; don't freeze the screen
    } finally {
      setLoading(false);
    }
  }, []); // stable — no deps needed, reads via refs

  // Load on mount
  useEffect(() => {
    loadContacts(true);
  }, [loadContacts]);

  // Refresh silently each time the screen comes back into focus
  // (picks up new contacts added to the iPhone rubrica in the meantime)
  useFocusEffect(
    useCallback(() => {
      loadContacts(false);
    }, [loadContacts]),
  );

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

  // Visible contacts: exclude the ones the user just removed in this session
  // visibleContacts = all contacts minus those just removed in this session
  const visibleContacts = contacts.filter(
    (c) => !recentlyRemoved.has(c.phoneContactId),
  );

  // filteredContacts = visibleContacts narrowed by the search query
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredContacts = trimmedQuery
    ? visibleContacts.filter((c) => c.name.toLowerCase().includes(trimmedQuery))
    : visibleContacts;

  // Selectable = currently visible AND not yet imported
  const selectableContacts = filteredContacts.filter(
    (c) => !importedEventByContact.has(c.phoneContactId),
  );

  const toggleAll = () => {
    // Operate only on contacts currently visible (respects active search)
    const selectableIds = selectableContacts.map((c) => c.phoneContactId);
    const allSelectedNow = selectableIds.every((id) => selectedToAdd.has(id));
    setSelectedToAdd((prev) => {
      const next = new Set(prev);
      if (allSelectedNow) {
        for (const id of selectableIds) next.delete(id);
      } else {
        for (const id of selectableIds) next.add(id);
      }
      return next;
    });
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
    // Refresh list so newly-imported show as green and remaining stay selectable
    await loadContacts(false);

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
            // Hide just-removed contacts so they disappear from the list
            // instead of reappearing as "ready to re-import"
            setRecentlyRemoved((prev) => {
              const next = new Set(prev);
              for (const id of ids) next.add(id);
              return next;
            });
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

  if (visibleContacts.length === 0) {
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
  const allSelectedInView =
    selectableContacts.length > 0 &&
    selectableContacts.every((c) => selectedToAdd.has(c.phoneContactId));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={[
              styles.searchInput,
              { color: colors.text, marginLeft: spacing.sm },
            ]}
            placeholder={t('importContacts.searchPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Header with count + select all (acts on filtered view) */}
      <View style={[styles.headerRow, { padding: spacing.md }]}>
        <Text
          style={[typo.body, styles.headerText, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {t('importContacts.found', { count: filteredContacts.length })}
        </Text>
        {selectableContacts.length > 0 && (
          <TouchableOpacity onPress={toggleAll} style={styles.headerAction}>
            <Text
              style={[typo.body, { color: colors.primary, fontWeight: '600' }]}
              numberOfLines={1}
            >
              {allSelectedInView
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

      {/* Contact list (search-filtered) */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.phoneContactId}
        renderItem={renderContact}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          trimmedQuery ? (
            <Text
              style={[
                typo.body,
                {
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: spacing.xl,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              {t('importContacts.noSearchResults', { query: searchQuery })}
            </Text>
          ) : null
        }
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
});
