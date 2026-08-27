import { Capsule, Circle, HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, frame, opacity, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';

/**
 * The order card on the Lock Screen and in the Dynamic Island.
 *
 * ## Colour is the system's to choose - except on the track
 *
 * The Lock Screen puts the card on a dark material whichever appearance the phone is in,
 * so named ink colours go missing. Text uses `primary` and `secondary`, which follow the
 * material.
 *
 * The track is the exception, and it is green, amber and grey. Red is not part of
 * progress at all: it belongs to a cancelled order, which is what red already means in
 * `statusStyle` everywhere else in the app.
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
  /** 0, 1, 2 or 3 - how many of the three steps are done. */
  done: number;
  /** The line under the order number, already translated by the sender. */
  status: string;
  /** The three step labels, already translated and already COD-aware. */
  steps: [string, string, string];
  /** True once the order is cancelled: the track stops. */
  cancelled?: boolean;
  /**
   * The delivery promise, already translated and naming the destination, e.g.
   * "Arriving in Dubai within 1-2 hours". Absent before the order is accepted and once it
   * is over - the sender decides, because the window depends on the emirate. The line is
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

  /**
   * Done is green, the step in hand is amber, what has not started recedes into grey.
   * Red is not in the track at all - it belongs to a cancelled order and nothing else.
   *
   * Brand red used to paint the progress, and that was wrong twice over. Red on a
   * *finished* step reads as a fault, and `statusStyle` in `utils/theme.js` already spends
   * red on cancelled, failed and refunded everywhere else in the app. A colour cannot mean
   * "going well" here and "gone wrong" three screens away.
   *
   * These are the dark-surface variants of the app's own hues. `theme.js` tunes its green
   * and amber for a cream page, where they clear 4.5:1; on the Lock Screen's dark material
   * the same values drop to roughly 4:1 and go muddy. These clear 10:1.
   */
  const green = '#30D158';
  const amber = '#FF9F0A';
  const red = '#FF453A';

  /**
   * A cancelled order has no step in hand, so nothing is the frontier. Without the
   * `cancelled` check it would light its first node, since `done` is zero either way.
   */
  const stateOf = (index: number) => {
    if (done > index) return 'done';
    if (!props.cancelled && done === index) return 'current';
    return 'future';
  };

  const tintOf = (state: string) => (state === 'done' ? green : amber);

  /**
   * A node on the track.
   *
   * Size carries the same information as colour, because colour alone is not a signal
   * everyone can read: green and amber are one shade apart under deuteranopia, which is
   * roughly one man in twelve. A future step is smaller as well as quieter.
   *
   * A ring - `strokeBorder` on a clear circle - is the textbook drawing for a step in
   * progress, and both exist in `@expo/ui`. It is not used because nothing here can be
   * checked before it is on a customer's Lock Screen, and a modifier that silently fails
   * leaves a hole in the track exactly where the current step should be.
   */
  const node = (index: number) => {
    const state = stateOf(index);
    return (
      <Circle
        modifiers={
          state === 'future'
            ? [frame({ width: 7, height: 7 }), foregroundStyle('secondary'), opacity(0.45)]
            : [frame({ width: 10, height: 10 }), foregroundStyle(tintOf(state))]
        }
      />
    );
  };

  /**
   * The leg leading into a node, which takes that node's colour: legs already travelled
   * read green, the leg being travelled reads amber. The track becomes a path rather than
   * three unrelated pips.
   *
   * Shapes are flexible in SwiftUI, so this takes whatever width the row has left - which
   * is what keeps the three labels under their own nodes at every text size.
   */
  const rail = (into: number) => {
    const state = stateOf(into);
    return (
      <Capsule
        modifiers={
          state === 'future'
            ? [frame({ height: 2 }), foregroundStyle('secondary'), opacity(0.3)]
            : [frame({ height: 2 }), foregroundStyle(tintOf(state))]
        }
      />
    );
  };

  // The same three states as the nodes: done is emphatic, the step in hand is legible,
  // and what has not started yet recedes.
  const label = (index: number, text: string) => (
    <Text
      modifiers={[
        font({ size: 10, weight: done > index ? 'semibold' : 'regular' }),
        foregroundStyle(stateOf(index) === 'future' ? 'secondary' : 'primary'),
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
      <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle('primary')]}>
        {props.eta}
      </Text>
      <Spacer />
    </HStack>
  ) : null;

  /**
   * The one place red belongs. A cancelled order stops the track, so without this the
   * card would say something went wrong in grey and look like any other quiet state.
   *
   * `#FF453A` clears 5.4:1 on this material, so it is legible as body text - the brand's
   * own `#dc2626` reaches only 3.8:1 and would not be.
   */
  const statusTint = props.cancelled ? red : 'primary';

  const heading = (size: number) => (
    <HStack>
      <Text modifiers={[font({ size, weight: 'semibold' }), foregroundStyle(statusTint)]}>
        {props.status}
      </Text>
      <Spacer />
    </HStack>
  );

  // The Dynamic Island gets the frontier's colour: amber while something is happening,
  // green once everything is, red if it stopped.
  const islandTint = props.cancelled ? red : done >= 3 ? green : amber;

  const track = (
    <VStack spacing={7}>
      <HStack spacing={6} alignment="center">
        {node(0)}
        {rail(1)}
        {node(1)}
        {rail(2)}
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

        {heading(17)}

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
      <Text modifiers={[font({ size: 12 }), foregroundStyle(islandTint)]}>{'\u25CF'}</Text>
    ),
    compactTrailing: (
      <Text modifiers={[font({ size: 12 }), foregroundStyle('primary')]}>{done + '/3'}</Text>
    ),
    minimal: (
      <Text modifiers={[font({ size: 12 }), foregroundStyle(islandTint)]}>{'\u25CF'}</Text>
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
        {heading(15)}
        {eta}
        {track}
      </VStack>
    ),
  };
};

export default createLiveActivity('OrderActivity', OrderActivity);
