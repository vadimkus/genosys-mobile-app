import { HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';

/**
 * The order card on the Lock Screen and in the Dynamic Island.
 *
 * ## Colour is the system's to choose
 *
 * The first version that rendered used cera ink, `#191716`, and was almost unreadable:
 * the Lock Screen puts the card on a dark material whichever appearance the phone is in,
 * so near-black text lands on near-black. `environment.colorScheme` does not describe the
 * card, it describes the device.
 *
 * `primary` and `secondary` are SwiftUI's semantic colours and follow whatever material
 * the card is actually sitting on. Nothing here should name a colour.
 *
 * ## The layout must be self-contained
 *
 * Babel serialises the body of this function into a **string**, which the widget
 * extension evaluates in a runtime holding only the `@expo/ui` primitives, the modifiers
 * and a jsx stub. It cannot see this module, so a reference to anything declared outside
 * the function throws — and the card renders empty, silently.
 * `scripts/smoke-widget-layout.js` fails the build if that creeps back.
 *
 * Everything is text and stacks for the same reason: keep what renders, add richness a
 * piece at a time and check on a device between each.
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

const OrderActivity = (props: OrderActivityProps) => {
  'widget';

  const done = props.cancelled ? 0 : props.done;
  // Filled where the order has been, hollow where it has not. Characters draw reliably;
  // an empty view with a colour on it does not.
  const bar =
    (done > 0 ? '●' : '○') +
    '━━━━━' +
    (done > 1 ? '●' : '○') +
    '━━━━━' +
    (done > 2 ? '●' : '○');

  return {
    banner: (
      <VStack spacing={7} modifiers={[padding({ horizontal: 16, vertical: 13 })]}>
        {/* The mark and the order number: quiet, because neither is the news. */}
        <HStack>
          <Text
            modifiers={[
              font({ size: 10, weight: 'semibold' }),
              foregroundStyle('secondary'),
            ]}
          >
            {'G E N O S Y S'}
          </Text>
          <Spacer />
          <Text modifiers={[font({ size: 11 }), foregroundStyle('secondary')]}>
            {'#' + props.orderNumber}
          </Text>
        </HStack>

        {/* What is happening now. This is what the card is for. */}
        <HStack>
          <Text modifiers={[font({ size: 17, weight: 'semibold' }), foregroundStyle('primary')]}>
            {props.status}
          </Text>
          <Spacer />
        </HStack>

        <HStack>
          <Text modifiers={[font({ size: 13 }), foregroundStyle('primary')]}>{bar}</Text>
          <Spacer />
        </HStack>

        {/* The three stops, spread to sit under the bar. */}
        <HStack>
          <Text
            modifiers={[
              font({ size: 11, weight: done > 0 ? 'semibold' : 'regular' }),
              foregroundStyle(done > 0 ? 'primary' : 'secondary'),
            ]}
          >
            {props.steps[0]}
          </Text>
          <Spacer />
          <Text
            modifiers={[
              font({ size: 11, weight: done > 1 ? 'semibold' : 'regular' }),
              foregroundStyle(done > 1 ? 'primary' : 'secondary'),
            ]}
          >
            {props.steps[1]}
          </Text>
          <Spacer />
          <Text
            modifiers={[
              font({ size: 11, weight: done > 2 ? 'semibold' : 'regular' }),
              foregroundStyle(done > 2 ? 'primary' : 'secondary'),
            ]}
          >
            {props.steps[2]}
          </Text>
        </HStack>
      </VStack>
    ),

    compactLeading: (
      <Text modifiers={[font({ size: 13 }), foregroundStyle('primary')]}>{'●'}</Text>
    ),
    compactTrailing: (
      <Text modifiers={[font({ size: 13 }), foregroundStyle('primary')]}>{done + '/3'}</Text>
    ),
    minimal: (
      <Text modifiers={[font({ size: 13 }), foregroundStyle('primary')]}>{done + '/3'}</Text>
    ),

    expandedLeading: (
      <VStack modifiers={[padding({ all: 10 })]}>
        <Text modifiers={[font({ size: 11 }), foregroundStyle('secondary')]}>
          {'#' + props.orderNumber}
        </Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack modifiers={[padding({ all: 10 })]}>
        <Text modifiers={[font({ size: 11 }), foregroundStyle('secondary')]}>
          {done + ' / 3'}
        </Text>
      </VStack>
    ),
    expandedBottom: (
      <VStack spacing={6} modifiers={[padding({ horizontal: 14, bottom: 12 })]}>
        <Text modifiers={[font({ size: 15, weight: 'semibold' }), foregroundStyle('primary')]}>
          {props.status}
        </Text>
        <Text modifiers={[font({ size: 13 }), foregroundStyle('primary')]}>{bar}</Text>
      </VStack>
    ),
  };
};

export default createLiveActivity('OrderActivity', OrderActivity);
