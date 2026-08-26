import { HStack, Image, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, frame, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

/**
 * The order card on the Lock Screen and in the Dynamic Island.
 *
 * This renders in a widget extension, not in the app: a separate JS runtime with a tight
 * time budget, often while the app is not running. So it takes everything it needs as
 * flat props and derives nothing — no imports from `utils/`, no network, no context.
 * `buildOrderActivityState` in `utils/orderActivity.js` is what turns an order into these
 * props, on the app side and on the server side both.
 *
 * The props are also a wire format. The server sends them inside an APNs payload, and
 * ActivityKit will decode nothing if the shape does not match — the failure mode is a
 * push that reports success and displays nothing. Change these and you change the server.
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
  /** True once the order is cancelled: the bar greys out and stops. */
  cancelled?: boolean;
};

const INK = '#191716';
const MUTED = '#776E68';
const LINE = '#E8E0DB';
const CREAM = '#FAF7F5';

const OrderActivity = (props: OrderActivityProps, environment: LiveActivityEnvironment) => {
  'widget';

  const dark = environment.colorScheme === 'dark';
  const ink = dark ? '#FFFFFF' : INK;
  const muted = dark ? '#B8AEA8' : MUTED;
  const track = dark ? '#3A3634' : LINE;
  const fill = props.cancelled ? track : ink;

  // Three segments, filled left to right. Discrete rather than a percentage, so the bar
  // always lines up with the labels underneath it.
  const bar = (
    <HStack spacing={4}>
      {[0, 1, 2].map((i) => (
        <VStack
          key={i}
          modifiers={[
            frame({ height: 4 }),
            foregroundStyle(i < props.done ? fill : track),
          ]}
        />
      ))}
    </HStack>
  );

  return {
    banner: (
      <VStack spacing={10} modifiers={[padding({ all: 14 })]}>
        <HStack>
          <Image systemName="shippingbox.fill" color={ink} />
          <Text modifiers={[font({ weight: 'semibold', size: 15 }), foregroundStyle(ink)]}>
            {`#${props.orderNumber}`}
          </Text>
          <Spacer />
          <Text modifiers={[font({ size: 13 }), foregroundStyle(muted)]}>
            {props.steps[Math.min(Math.max(props.done, 0), 2)]}
          </Text>
        </HStack>
        {bar}
        <Text modifiers={[font({ size: 13 }), foregroundStyle(muted)]}>{props.status}</Text>
      </VStack>
    ),

    compactLeading: <Image systemName="shippingbox.fill" color={ink} />,
    compactTrailing: (
      <Text modifiers={[font({ size: 13 }), foregroundStyle(ink)]}>{`${props.done}/3`}</Text>
    ),
    minimal: <Image systemName="shippingbox.fill" color={ink} />,

    expandedLeading: (
      <VStack modifiers={[padding({ all: 10 })]}>
        <Image systemName="shippingbox.fill" color={ink} />
      </VStack>
    ),
    expandedTrailing: (
      <VStack modifiers={[padding({ all: 10 })]}>
        <Text modifiers={[font({ weight: 'semibold', size: 15 }), foregroundStyle(ink)]}>
          {`#${props.orderNumber}`}
        </Text>
      </VStack>
    ),
    expandedBottom: (
      <VStack spacing={8} modifiers={[padding({ horizontal: 12, bottom: 10 })]}>
        {bar}
        <HStack>
          {props.steps.map((label, i) => (
            <HStack key={label + i}>
              <Text
                modifiers={[
                  font({ size: 11, weight: i < props.done ? 'semibold' : 'regular' }),
                  foregroundStyle(i < props.done ? ink : muted),
                ]}
              >
                {label}
              </Text>
              <Spacer />
            </HStack>
          ))}
        </HStack>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(muted)]}>{props.status}</Text>
      </VStack>
    ),
  };
};

export default createLiveActivity('OrderActivity', OrderActivity);
