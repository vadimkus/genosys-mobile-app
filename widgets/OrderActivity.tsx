import { Capsule, Circle, HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, frame, opacity, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';

/**
 * The order card on the Lock Screen and in the Dynamic Island.
 *
 * ## Colour is the system's to choose — except one
 *
 * The Lock Screen puts the card on a dark material whichever appearance the phone is in,
 * so named ink colours go missing. Text uses `primary` and `secondary`, which follow the
 * material.
 *
 * The single exception is the track. Brand red on the progress a customer has actually
 * made is the one thing that makes this card ours rather than any courier's, and a
 * graphic element only needs 3:1 — which `#dc2626` clears on the Lock Screen's material.
 * Text is never drawn in it.
 *
 * ## No images
 *
 * `<Image uiImage>` ignores `frame` and paints the asset across the whole card. The white
 * wordmark is a black field with a red mark, which is why an early version had a giant sun
 * behind the copy. A text mark is the only size we control.
 *
 * ## The layout must be self-contained
 *
 * Babel serialises the body of this function into a string, and the widget extension
 * evaluates it in a runtime holding only the `@expo/ui` exports. A reference to anything
 * declared outside the function throws and the card renders empty, silently. Helpers live
 * inside. `scripts/smoke-widget-layout.js` fails the build if that slips.
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
  /** True once the order is cancelled: the track stops. */
  cancelled?: boolean;
  /**
   * The delivery promise, already translated, e.g. "Arriving within 1–2 hours". Absent
   * before the order is accepted and once it is over — the sender decides, because the
   * window depends on the emirate. The line is simply not drawn when it is missing.
   */
  eta?: string;
  /** Where it is going, already translated. Travels with `eta` and hangs opposite it. */
  place?: string;
  /**
   * Ignored. Kept on the type so a payload that still carries a device-local path does not
   * fail to decode. Do not render it.
   */
  logoUri?: string;
  /** Rewards tier, e.g. "SILVER". Omitted for a guest or when it could not be read. */
  tier?: string;
  /** Points balance. Omitted alongside `tier`. */
  points?: number;
};

const OrderActivity = (props: OrderActivityProps) => {
  'widget';

  const done = props.cancelled ? 0 : props.done;
  const brand = '#dc2626';

  // A node on the track. Reached is brand and larger; ahead is a quiet grey pip, so the
  // customer reads their position from shape as well as colour.
  const node = (reached: boolean) => (
    <Circle
      modifiers={
        reached
          ? [frame({ width: 9, height: 9 }), foregroundStyle(brand)]
          : [frame({ width: 7, height: 7 }), foregroundStyle('secondary'), opacity(0.45)]
      }
    />
  );

  // The rail between two nodes. Shapes are flexible in SwiftUI, so this takes whatever
  // width the row has left — which is what keeps the three labels under their own nodes
  // at every text size.
  const rail = (lit: boolean) => (
    <Capsule
      modifiers={
        lit
          ? [frame({ height: 2 }), foregroundStyle(brand)]
          : [frame({ height: 2 }), foregroundStyle('secondary'), opacity(0.25)]
      }
    />
  );

  // Three states, not two: done is emphatic, the step being worked on is legible, and
  // what has not started yet recedes.
  const label = (index: number, text: string) => (
    <Text
      modifiers={[
        font({ size: 10, weight: done > index ? 'semibold' : 'regular' }),
        foregroundStyle(done >= index ? 'primary' : 'secondary'),
      ]}
    >
      {text}
    </Text>
  );

  // Between the status and the track: the answer to the question the customer actually
  // has. Smaller than the status so it does not compete, brighter than the step labels
  // so it does not read as metadata.
  //
  // The destination hangs on the opposite edge rather than being joined to the promise
  // with a separator, which would run into the edge of the card at "Umm Al Quwain".
  const eta = props.eta ? (
    <HStack>
      {/* `primary`, not brand: at 13pt semibold this is body text and owes 4.5:1, which
          the red does not clear on the Lock Screen's material. The red stays on the
          track, where 3:1 is the bar. */}
      <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle('primary')]}>
        {props.eta}
      </Text>
      <Spacer />
      {props.place ? (
        <Text modifiers={[font({ size: 12 }), foregroundStyle('secondary')]}>{props.place}</Text>
      ) : null}
    </HStack>
  ) : null;

  const track = (
    <VStack spacing={7}>
      <HStack spacing={6} alignment="center">
        {node(done > 0)}
        {rail(done > 1)}
        {node(done > 1)}
        {rail(done > 2)}
        {node(done > 2)}
      </HStack>
      <HStack>
        {label(0, props.steps[0])}
        <Spacer />
        {label(1, props.steps[1])}
        <Spacer />
        {label(2, props.steps[2])}
      </HStack>
    </VStack>
  );

  return {
    banner: (
      <VStack spacing={9} modifiers={[padding({ horizontal: 16, vertical: 13 })]}>
        <HStack>
          <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle('secondary')]}>
            {'GENOSYS'}
          </Text>
          <Spacer />
          <Text modifiers={[font({ size: 11 }), foregroundStyle('secondary')]}>
            {'#' + props.orderNumber}
          </Text>
        </HStack>

        <HStack>
          <Text modifiers={[font({ size: 17, weight: 'semibold' }), foregroundStyle('primary')]}>
            {props.status}
          </Text>
          <Spacer />
        </HStack>

        {eta}

        {track}

        {/* Rewards are a courtesy, not the news: quieter than the step labels above. */}
        {props.tier ? (
          <HStack modifiers={[opacity(0.75)]}>
            <Text modifiers={[font({ size: 10 }), foregroundStyle('secondary')]}>{props.tier}</Text>
            <Spacer />
            <Text modifiers={[font({ size: 10 }), foregroundStyle('secondary')]}>
              {(props.points ?? 0) + ' pts'}
            </Text>
          </HStack>
        ) : null}
      </VStack>
    ),

    compactLeading: (
      <Text modifiers={[font({ size: 12 }), foregroundStyle(done > 0 ? brand : 'secondary')]}>
        {'\u25CF'}
      </Text>
    ),
    compactTrailing: (
      <Text modifiers={[font({ size: 12 }), foregroundStyle('primary')]}>{done + '/3'}</Text>
    ),
    minimal: (
      <Text modifiers={[font({ size: 12 }), foregroundStyle(done > 0 ? brand : 'secondary')]}>
        {'\u25CF'}
      </Text>
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
        <Text modifiers={[font({ size: 11 }), foregroundStyle('secondary')]}>{done + '/3'}</Text>
      </VStack>
    ),
    expandedBottom: (
      <VStack spacing={9} modifiers={[padding({ horizontal: 14, bottom: 12 })]}>
        <HStack>
          <Text modifiers={[font({ size: 15, weight: 'semibold' }), foregroundStyle('primary')]}>
            {props.status}
          </Text>
          <Spacer />
        </HStack>
        {eta}
        {track}
      </VStack>
    ),
  };
};

export default createLiveActivity('OrderActivity', OrderActivity);
