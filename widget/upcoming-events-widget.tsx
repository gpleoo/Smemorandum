import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface WidgetEvent {
  id: string;
  title: string;
  date: string; // "dd MMM"
  daysLeft: number;
}

interface UpcomingEventsWidgetProps {
  events: WidgetEvent[];
}

export function UpcomingEventsWidget({ events }: UpcomingEventsWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 12,
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <TextWidget
          text="📅 Smemorandum"
          style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: '#6C63FF',
          }}
        />
      </FlexWidget>

      {/* Events list */}
      {events.length === 0 ? (
        <FlexWidget
          style={{
            width: 'match_parent',
            height: 'match_parent',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TextWidget
            text="Nessun evento in programma"
            style={{ fontSize: 12, color: '#999999' }}
          />
        </FlexWidget>
      ) : (
        events.map((event, index) => (
          <FlexWidget
            key={event.id}
            clickAction="OPEN_EVENT"
            clickActionData={{ eventId: event.id }}
            style={{
              width: 'match_parent',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 4,
              borderBottomWidth: index < events.length - 1 ? 1 : 0,
              borderBottomColor: '#F0F0F0',
            }}
          >
            <FlexWidget style={{ flexDirection: 'column', flex: 1 }}>
              <TextWidget
                text={event.title}
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: '#1A1A2E',
                }}
                maxLines={1}
              />
              <TextWidget
                text={event.date}
                style={{ fontSize: 11, color: '#888888' }}
              />
            </FlexWidget>
            <FlexWidget
              style={{
                backgroundColor: event.daysLeft === 0 ? '#FF6584' : event.daysLeft <= 7 ? '#F59E0B' : '#6C63FF',
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <TextWidget
                text={event.daysLeft === 0 ? 'Oggi' : `${event.daysLeft}g`}
                style={{ fontSize: 11, fontWeight: 'bold', color: '#FFFFFF' }}
              />
            </FlexWidget>
          </FlexWidget>
        ))
      )}
    </FlexWidget>
  );
}
