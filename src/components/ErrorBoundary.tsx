import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { captureException } from '../services/crashReporting';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    captureException(error, info.componentStack ?? undefined);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    if (this.state.error) {
      return <Fallback error={this.state.error} onReset={this.reset} />;
    }
    return this.props.children;
  }
}

function Fallback({ error, onReset }: { error: Error; onReset: () => void }) {
  // Kept intentionally low-level: cannot depend on ThemeProvider/i18n
  // because the error may have come from one of those.
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>😵</Text>
      <Text style={styles.title}>Qualcosa è andato storto</Text>
      <Text style={styles.body} numberOfLines={4}>
        {error.message || 'Errore sconosciuto'}
      </Text>
      <TouchableOpacity style={styles.btn} onPress={onReset} activeOpacity={0.8}>
        <Text style={styles.btnText}>Riprova</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#0A84FF',
  },
  btnText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
