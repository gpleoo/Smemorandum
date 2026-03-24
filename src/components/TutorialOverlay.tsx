import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { useTutorial } from '../context/TutorialContext';

interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
}

interface TutorialStep {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  tooltipPosition: 'top' | 'center';
}

const STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    titleKey: 'tutorial.step1Title',
    descriptionKey: 'tutorial.step1Description',
    icon: 'home',
    tooltipPosition: 'center',
  },
  {
    id: 'fab',
    titleKey: 'tutorial.step2Title',
    descriptionKey: 'tutorial.step2Description',
    icon: 'add-circle',
    tooltipPosition: 'top',
  },
  {
    id: 'tabs',
    titleKey: 'tutorial.step3Title',
    descriptionKey: 'tutorial.step3Description',
    icon: 'apps',
    tooltipPosition: 'top',
  },
  {
    id: 'eventTypes',
    titleKey: 'tutorial.step4Title',
    descriptionKey: 'tutorial.step4Description',
    icon: 'git-compare',
    tooltipPosition: 'center',
  },
  {
    id: 'calendar',
    titleKey: 'tutorial.step5Title',
    descriptionKey: 'tutorial.step5Description',
    icon: 'calendar',
    tooltipPosition: 'top',
  },
  {
    id: 'settings',
    titleKey: 'tutorial.step6Title',
    descriptionKey: 'tutorial.step6Description',
    icon: 'settings',
    tooltipPosition: 'top',
  },
];

const FAB_SIZE = 56;
const TAB_BAR_CONTENT_HEIGHT = 49;
const OVERLAY_COLOR = 'rgba(0,0,0,0.75)';

function getSpotlight(
  stepId: string,
  screenWidth: number,
  screenHeight: number,
  bottomInset: number
): SpotlightRect | null {
  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + bottomInset;
  const tabWidth = screenWidth / 4;

  switch (stepId) {
    case 'fab':
      return {
        x: screenWidth - 20 - FAB_SIZE,
        y: screenHeight - tabBarHeight - 24 - FAB_SIZE,
        width: FAB_SIZE,
        height: FAB_SIZE,
        borderRadius: FAB_SIZE / 2,
      };
    case 'tabs':
      return {
        x: 0,
        y: screenHeight - tabBarHeight,
        width: screenWidth,
        height: tabBarHeight,
        borderRadius: 0,
      };
    case 'calendar':
      return {
        x: tabWidth * 1,
        y: screenHeight - tabBarHeight,
        width: tabWidth,
        height: tabBarHeight,
        borderRadius: 0,
      };
    case 'settings':
      return {
        x: tabWidth * 3,
        y: screenHeight - tabBarHeight,
        width: tabWidth,
        height: tabBarHeight,
        borderRadius: 0,
      };
    default:
      return null;
  }
}

export function TutorialOverlay() {
  const { isTutorialVisible, completeTutorial } = useTutorial();
  const { t } = useTranslation();
  const { colors, spacing, borderRadius, typography: typo } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentFadeAnim = useRef(new Animated.Value(1)).current;

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    if (isTutorialVisible) {
      setCurrentStep(0);
      fadeAnim.setValue(0);
      contentFadeAnim.setValue(1);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isTutorialVisible]);

  const animateStepTransition = (nextStep: number) => {
    Animated.timing(contentFadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(nextStep);
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      animateStepTransition(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      completeTutorial();
    });
  };

  if (!isTutorialVisible) return null;

  const step = STEPS[currentStep];
  const spotlight = getSpotlight(step.id, screenWidth, screenHeight, insets.bottom);
  const isLastStep = currentStep === STEPS.length - 1;

  const renderOverlay = () => {
    if (!spotlight) {
      return (
        <Animated.View
          style={[styles.fullOverlay, { opacity: fadeAnim }]}
          pointerEvents="none"
        />
      );
    }

    const { x, y, width, height } = spotlight;
    return (
      <>
        {/* Top region */}
        <Animated.View
          style={[styles.overlayRegion, { top: 0, left: 0, right: 0, height: y, opacity: fadeAnim }]}
          pointerEvents="none"
        />
        {/* Bottom region */}
        <Animated.View
          style={[styles.overlayRegion, { top: y + height, left: 0, right: 0, bottom: 0, opacity: fadeAnim }]}
          pointerEvents="none"
        />
        {/* Left region */}
        <Animated.View
          style={[styles.overlayRegion, { top: y, left: 0, width: x, height, opacity: fadeAnim }]}
          pointerEvents="none"
        />
        {/* Right region */}
        <Animated.View
          style={[styles.overlayRegion, { top: y, left: x + width, right: 0, height, opacity: fadeAnim }]}
          pointerEvents="none"
        />
        {/* Spotlight glow border */}
        <Animated.View
          style={{
            position: 'absolute',
            top: y - 4,
            left: x - 4,
            width: width + 8,
            height: height + 8,
            borderRadius: spotlight.borderRadius + 4,
            borderWidth: 2,
            borderColor: colors.primary,
            opacity: fadeAnim,
          }}
          pointerEvents="none"
        />
      </>
    );
  };

  const renderTooltip = () => {
    const tooltipStyle: any = {
      position: 'absolute' as const,
      left: spacing.lg,
      right: spacing.lg,
    };

    if (step.tooltipPosition === 'center') {
      tooltipStyle.top = screenHeight * 0.3;
    } else if (spotlight) {
      tooltipStyle.bottom = screenHeight - spotlight.y + spacing.md;
    }

    return (
      <Animated.View
        style={[
          tooltipStyle,
          {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            opacity: contentFadeAnim,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          },
        ]}
      >
        {/* Arrow pointing down */}
        {step.tooltipPosition === 'top' && spotlight && (
          <View
            style={[
              styles.arrow,
              {
                left: Math.min(
                  Math.max(spotlight.x + spotlight.width / 2 - spacing.lg - 8, 8),
                  screenWidth - spacing.lg * 2 - 24
                ),
              },
            ]}
          >
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: 8,
                borderRightWidth: 8,
                borderTopWidth: 8,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: colors.surface,
              }}
            />
          </View>
        )}

        {/* Icon */}
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.primary + '20', marginBottom: spacing.sm },
          ]}
        >
          <Ionicons name={step.icon as any} size={28} color={colors.primary} />
        </View>

        {/* Title */}
        <Text
          style={[
            typo.h3,
            { color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
          ]}
        >
          {t(step.titleKey)}
        </Text>

        {/* Description */}
        <Text
          style={[
            typo.body,
            {
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: spacing.lg,
              lineHeight: 22,
            },
          ]}
        >
          {t(step.descriptionKey)}
        </Text>

        {/* Step dots */}
        <View style={styles.dotsRow}>
          {STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentStep ? colors.primary : colors.textTertiary,
                  width: index === currentStep ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Next/Got it button */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor: colors.primary,
              borderRadius: borderRadius.lg,
              paddingVertical: spacing.sm + 2,
              marginTop: spacing.md,
            },
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={[typo.button, { color: '#FFF' }]}>
            {isLastStep ? t('tutorial.gotIt') : t('tutorial.next')}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Touchable backdrop to prevent interaction with underlying UI */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={() => {}}
      />

      {renderOverlay()}
      {renderTooltip()}

      {/* Skip button */}
      {!isLastStep && (
        <Animated.View
          style={[
            styles.skipContainer,
            { top: insets.top + spacing.md, right: spacing.lg, opacity: contentFadeAnim },
          ]}
        >
          <TouchableOpacity onPress={handleComplete} style={{ padding: spacing.sm }}>
            <Text style={[typo.body, { color: colors.textTertiary }]}>
              {t('tutorial.skip')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OVERLAY_COLOR,
  },
  overlayRegion: {
    position: 'absolute',
    backgroundColor: OVERLAY_COLOR,
  },
  arrow: {
    position: 'absolute',
    bottom: -8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  nextButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipContainer: {
    position: 'absolute',
  },
});
