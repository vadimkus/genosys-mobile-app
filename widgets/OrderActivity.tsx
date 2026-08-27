import { HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

/**
 * The order card on the Lock Screen and in the Dynamic Island.
 *
 * This renders in a widget extension, not in the app: a separate JS runtime with no React
 * and no React Native, holding only the @expo/ui primitives and the modifiers. It takes
 * everything it needs as flat props and derives nothing.
 *
 * **A layout that throws renders an empty card**, with no error surfaced anywhere — which
 * is exactly what the first version did on device. So this one is deliberately plain:
 * text and stacks, no images, no frames, no backgrounds. The progress bar is drawn with
 * characters rather than filled views, because a `VStack` with no children and a
 * `foregroundStyle` — what the first version used — paints nothing at all: foreground is
 * the colour of *content*, and an empty container has none.
 *
 * Add richness back one piece at a time, checking on a device between each. The layout is
 * stored into the App Group by the app at runtime, so it ships over the air; a change
 * here does not need a new build.
 */
export type OrderActivityProps = {
  /** Shown to the customer, e.g. "46125502". */
  orderNumber: string;
  /** 0, 1, 2 or 3 — how many of the three steps are done. */
  done: number;
  /** The line under the order number, already translated by the sender. */
  status: string;
  /** The three step labels, already translated and already COD-aware. */
  steps: [string, string, string];
  /** True once the order is cancelled: the bar stops. */
  cancelled?: boolean;
};

const INK = '#191716';
const MUTED = '#776E68';

const OrderActivity = (props: OrderActivityProps, environment: LiveActivityEnvironment) => {
  'widget';

  const dark = environment.colorScheme === 'dark';
  const ink = dark ? '#FFFFFF' : INK;
  const muted = dark ? '#B8AEA8' : MUTED;

  const done = props.cancelled ? 0 : props.done;
  // Filled and hollow circles joined by rules. Characters always draw; a view with no
  // content does not.
  const bar = [0, 1, 2].map((i) => (i < done ? '●' : '○')).join('━━━');
  const step = props.steps[done > 2 ? 2 : done] ?? props.steps[0];

  return {
    banner: (
      <VStack spacing={6} modifiers={[padding({ all: 14 })]}>
        <HStack>
          <Text modifiers={[font({ weight: 'semibold', size: 15 }), foregroundStyle(ink)]}>
            {'#' + props.orderNumber}
          </Text>
          <Spacer />
          <Text modifiers={[font({ size: 13 }), foregroundStyle(muted)]}>{step}</Text>
        </HStack>
        <HStack>
          <Text modifiers={[font({ size: 15 }), foregroundStyle(ink)]}>{bar}</Text>
          <Spacer />
        </HStack>
        <HStack>
          <Text modifiers={[font({ size: 13 }), foregroundStyle(muted)]}>{props.status}</Text>
          <Spacer />
        </HStack>
      </VStack>
    ),

    compactLeading: (
      <Text modifiers={[font({ size: 13 }), foregroundStyle(ink)]}>{'\u25CF'}</Text>
    ),
    compactTrailing: (
      <Text modifiers={[font({ size: 13 }), foregroundStyle(ink)]}>{done + '/3'}</Text>
    ),
    minimal: <Text modifiers={[font({ size: 13 }), foregroundStyle(ink)]}>{done + '/3'}</Text>,

    expandedLeading: (
      <VStack modifiers={[padding({ all: 10 })]}>
        <Text modifiers={[font({ size: 13 }), foregroundStyle(muted)]}>
          {'#' + props.orderNumber}
        </Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack modifiers={[padding({ all: 10 })]}>
        <Text modifiers={[font({ weight: 'semibold', size: 13 }), foregroundStyle(ink)]}>
          {step}
        </Text>
      </VStack>
    ),
    expandedBottom: (
      <VStack spacing={6} modifiers={[padding({ all: 10 })]}>
        <Text modifiers={[font({ size: 15 }), foregroundStyle(ink)]}>{bar}</Text>
        <Text modifiers={[font({ size: 13 }), foregroundStyle(muted)]}>{props.status}</Text>
      </VStack>
    ),
  };
};

export default createLiveActivity('OrderActivity', OrderActivity);
