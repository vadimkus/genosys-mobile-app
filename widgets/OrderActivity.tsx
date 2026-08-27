import { HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

/**
 * The order card on the Lock Screen and in the Dynamic Island.
 *
 * ## The layout must be self-contained
 *
 * Babel serialises the body of this function — everything after the `'widget'` directive —
 * into a **string**, which the widget extension evaluates in its own runtime. That runtime
 * has the `@expo/ui` primitives, the modifiers and a jsx stub on `globalThis`, and nothing
 * else. It does not have this module.
 *
 * So a reference to anything declared outside the function is a `ReferenceError` on
 * device. Two colour constants at module scope are what made the first two versions of
 * this render as an empty black card: it fails before producing a single node, and an
 * empty card is what the system draws when there are no nodes.
 *
 * Every value is therefore written inline, and `scripts/smoke-widget-layout.js` fails the
 * build if anything creeps back out of scope.
 *
 * Keep it plain for the same reason: a layout that throws shows nothing useful. Add
 * richness one piece at a time, checking on a device between each.
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

const OrderActivity = (props: OrderActivityProps, environment: LiveActivityEnvironment) => {
  'widget';

  // Inline, not module constants: see the note above. cera ink and cera muted, with
  // lighter equivalents for a dark Lock Screen.
  const dark = environment.colorScheme === 'dark';
  const ink = dark ? '#FFFFFF' : '#191716';
  const muted = dark ? '#B8AEA8' : '#776E68';

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

    compactLeading: <Text modifiers={[font({ size: 13 }), foregroundStyle(ink)]}>{'●'}</Text>,
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
