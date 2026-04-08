import WidgetKit
import SwiftUI

// ---------------------------------------------------------------------------
// Data model shared between App and Widget via App Group UserDefaults
// ---------------------------------------------------------------------------

struct WidgetEvent: Identifiable, Codable {
    let id: String
    let title: String
    let daysLeft: Int
    let dateLabel: String // "12 Apr"
}

// ---------------------------------------------------------------------------
// Timeline Provider
// ---------------------------------------------------------------------------

struct Provider: TimelineProvider {

    func placeholder(in context: Context) -> EventEntry {
        EventEntry(date: Date(), events: sampleEvents())
    }

    func getSnapshot(in context: Context, completion: @escaping (EventEntry) -> Void) {
        completion(EventEntry(date: Date(), events: loadEvents()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<EventEntry>) -> Void) {
        let events = loadEvents()
        let entry  = EventEntry(date: Date(), events: events)
        // Refresh every hour
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    // Read from App Group UserDefaults
    private func loadEvents() -> [WidgetEvent] {
        guard
            let defaults = UserDefaults(suiteName: "group.com.smemorandum.app"),
            let data = defaults.data(forKey: "widget_events"),
            let events = try? JSONDecoder().decode([WidgetEvent].self, from: data)
        else { return [] }
        return Array(events.prefix(5))
    }

    private func sampleEvents() -> [WidgetEvent] {
        [
            WidgetEvent(id: "1", title: "Compleanno di Marco", daysLeft: 2,  dateLabel: "10 Apr"),
            WidgetEvent(id: "2", title: "Bolletta luce",       daysLeft: 5,  dateLabel: "13 Apr"),
            WidgetEvent(id: "3", title: "Anniversario",        daysLeft: 12, dateLabel: "20 Apr"),
        ]
    }
}

// ---------------------------------------------------------------------------
// Timeline Entry
// ---------------------------------------------------------------------------

struct EventEntry: TimelineEntry {
    let date: Date
    let events: [WidgetEvent]
}

// ---------------------------------------------------------------------------
// Widget View — Small (shows next event only)
// ---------------------------------------------------------------------------

struct SmallWidgetView: View {
    let entry: EventEntry
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        let accent = Color(red: 108/255, green: 99/255, blue: 255/255)

        if let first = entry.events.first {
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Image(systemName: "calendar")
                        .font(.caption)
                        .foregroundColor(accent)
                    Text("Smemorandum")
                        .font(.caption2)
                        .fontWeight(.semibold)
                        .foregroundColor(accent)
                }
                Spacer()
                Text(first.title)
                    .font(.subheadline)
                    .fontWeight(.bold)
                    .lineLimit(2)
                    .foregroundColor(.primary)
                Spacer()
                HStack {
                    Text(first.dateLabel)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text(daysLabel(first.daysLeft))
                        .font(.caption)
                        .fontWeight(.semibold)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(accent.opacity(0.15))
                        .foregroundColor(accent)
                        .clipShape(Capsule())
                }
            }
            .padding(14)
            .containerBackground(Color(UIColor.systemBackground), for: .widget)
        } else {
            VStack(spacing: 6) {
                Image(systemName: "calendar.badge.plus")
                    .font(.title2)
                    .foregroundColor(accent)
                Text("Nessun evento")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .containerBackground(Color(UIColor.systemBackground), for: .widget)
        }
    }
}

// ---------------------------------------------------------------------------
// Widget View — Medium (shows up to 3 events)
// ---------------------------------------------------------------------------

struct MediumWidgetView: View {
    let entry: EventEntry
    let accent = Color(red: 108/255, green: 99/255, blue: 255/255)

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Image(systemName: "calendar")
                    .font(.caption)
                    .foregroundColor(accent)
                Text("Smemorandum")
                    .font(.caption2)
                    .fontWeight(.semibold)
                    .foregroundColor(accent)
                Spacer()
            }
            .padding(.bottom, 2)

            if entry.events.isEmpty {
                Spacer()
                Text("Nessun evento in programma")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
            } else {
                ForEach(entry.events.prefix(3)) { event in
                    HStack(alignment: .center, spacing: 8) {
                        VStack(alignment: .leading, spacing: 1) {
                            Text(event.title)
                                .font(.caption)
                                .fontWeight(.semibold)
                                .lineLimit(1)
                                .foregroundColor(.primary)
                            Text(event.dateLabel)
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        Text(daysLabel(event.daysLeft))
                            .font(.caption2)
                            .fontWeight(.bold)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(accent.opacity(0.15))
                            .foregroundColor(accent)
                            .clipShape(Capsule())
                    }
                    .padding(.vertical, 3)
                    .padding(.horizontal, 2)
                    .background(Color(UIColor.secondarySystemBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 6))
                }
            }
            Spacer(minLength: 0)
        }
        .padding(12)
        .containerBackground(Color(UIColor.systemBackground), for: .widget)
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

private func daysLabel(_ days: Int) -> String {
    switch days {
    case 0:  return "Oggi"
    case 1:  return "Domani"
    default: return "\(days)g"
    }
}

// ---------------------------------------------------------------------------
// Widget Configuration
// ---------------------------------------------------------------------------

struct SmemorandumWidget: Widget {
    let kind = "SmemorandumWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            GeometryReader { geo in
                if geo.size.width < 180 {
                    SmallWidgetView(entry: entry)
                } else {
                    MediumWidgetView(entry: entry)
                }
            }
        }
        .configurationDisplayName("Smemorandum")
        .description("Mostra i tuoi prossimi eventi e compleanni.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
