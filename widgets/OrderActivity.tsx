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
  /** The raw number, kept for the push alert. Prefer `orderLabel` for display. */
  orderNumber: string;
  /** The number as a sentence, already translated, e.g. "Order #46125502". */
  orderLabel?: string;
  /** 0, 1, 2 or 3 — how many of the three steps are done. */
  done: number;
  /** The line under the order number, already translated by the sender. */
  status: string;
  /** The three step labels, already translated and already COD-aware. */
  steps: [string, string, string];
  /** True once the order is cancelled: the track stops. */
  cancelled?: boolean;
  /**
   * The delivery promise, already translated and naming the destination, e.g.
   * "Arriving in Dubai within 1–2 hours". Absent before the order is accepted and once it
   * is over — the sender decides, because the window depends on the emirate. The line is
   * simply not drawn when it is missing.
   */
  eta?: string;
  /**
   * Ignored. Kept on the type so a payload that still carries a device-local path does not
   * fail to decode. Do not render it.
   */
  logoUri?: string;
  /** Rewards standing, already translated, e.g. "Your tier: SILVER". */
  tier?: string;
  /** Points balance, already translated and formatted, e.g. "32 pts". */
  points?: string;
};

const OrderActivity = (props: OrderActivityProps) => {
  'widget';

  const done = props.cancelled ? 0 : props.done;
  const brand = '#dc2626';

  /**
   * A node on the track, in one of three states.
   *
   * Two states would be a lie at the step being worked on: a solid brand dot on "Shipped"
   * says it has shipped. So the step in hand is the same brand red at half strength —
   * unmistakably the frontier, and unmistakably not finished.
   *
   * Size carries the same information as colour, because colour alone is not a signal
   * everyone can read.
   *
   * A ring — `strokeBorder` on a clear circle — is the textbook drawing for this, and both
   * exist in `@expo/ui`. It is not used because nothing here can be checked before it is on
   * a customer's Lock Screen, and a modifier that silently fails leaves a hole in the track
   * where the current step should be. `opacity` and `frame` are already on screen.
   */
  const node = (index: number) => (
    <Circle
      modifiers={
        done > index
          ? [frame({ width: 10, height: 10 }), foregroundStyle(brand)]
          : // A cancelled order has no step in hand, so nothing is the frontier. Without
            // this it would light its first node, since `done` is zero either way.
            !props.cancelled && done === index
            ? [frame({ width: 10, height: 10 }), foregroundStyle(brand), opacity(0.55)]
            : [frame({ width: 7, height: 7 }), foregroundStyle('secondary'), opacity(0.5)]
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
          : [frame({ height: 2 }), foregroundStyle('secondary'), opacity(0.3)]
      }
    />
  );

  // The same three states as the nodes: done is emphatic, the step in hand is legible,
  // and what has not started yet recedes.
  const label = (index: number, text: string) => (
    <Text
      modifiers={[
        font({ size: 10, weight: done > index ? 'semibold' : 'regular' }),
        foregroundStyle(!props.cancelled && done >= index ? 'primary' : 'secondary'),
      ]}
    >
      {text}
    </Text>
  );

  // Between the status and the track: the answer to the question the customer actually
  // has. Smaller than the status so it does not compete, brighter than the step labels
  // so it does not read as metadata.
  //
  const eta = props.eta ? (
    <HStack>
      {/* `primary`, not brand: at 13pt semibold this is body text and owes 4.5:1, which
          the red does not clear on the Lock Screen's material. The red stays on the
          track, where 3:1 is the bar. */}
      <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle('primary')]}>
        {props.eta}
      </Text>
      <Spacer />
    </HStack>
  ) : null;

  const track = (
    <VStack spacing={7}>
      <HStack spacing={6} alignment="center">
        {node(0)}
        {rail(done > 1)}
        {node(1)}
        {rail(done > 2)}
        {node(2)}
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
    // 14pt is the standard Lock Screen margin, which lines the card up with the
    // notifications above it. The whole thing has to stay under 160pt or the system
    // truncates it, which is why the name and the order number share a row.
    banner: (
      <VStack spacing={9} modifiers={[padding({ horizontal: 14, vertical: 14 })]}>
        <HStack>
          <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle('secondary')]}>
            {'GENOSYS MIDDLE EAST'}
          </Text>
          <Spacer />
          <Text modifiers={[font({ size: 11 }), foregroundStyle('secondary')]}>
            {props.orderLabel || '#' + props.orderNumber}
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
            {props.points ? (
              <Text modifiers={[font({ size: 10 }), foregroundStyle('secondary')]}>
                {props.points}
              </Text>
            ) : null}
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
          {props.orderLabel || '#' + props.orderNumber}
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
