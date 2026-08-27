import { Capsule, Circle, HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import {
  activityBackgroundTint,
  font,
  foregroundStyle,
  frame,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity } from 'expo-widgets';

/**
 * The order card on the Lock Screen and in the Dynamic Island.
 *
 * ## Two surfaces, two palettes
 *
 * The Lock Screen card is ours: `activityBackgroundTint` paints it cera cream, so it reads
 * as a piece of the brand rather than another dark slab in the stack. Everything on it is
 * the app's own cream-tuned palette.
 *
 * The Dynamic Island is not ours. Apple states plainly that compact, minimal and expanded
 * presentations use a black opaque background and cannot be customised, so those keep the
 * dark-surface variants of the same hues.
 *
 * That split is the whole reason `LIGHT` and `DARK` exist below. Painting the card cream
 * and leaving the island on the same colours would put ink text on black.
 *
 * ## Nothing here may be a semantic colour
 *
 * `primary` and `secondary` follow the *device* appearance, not the surface. With a cream
 * card that is fatal: in dark mode `primary` resolves to white, and the card goes blank.
 * Once the background is ours, every foreground has to be ours too.
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
   * The cream card. Every value is the app's own, and every one is measured against
   * `#faf7f5` rather than assumed:
   *
   *   ink      16.75:1   headline
   *   body     10.97:1   the delivery promise
   *   muted     5.95:1   order number, rewards
   *   roseInk   5.21:1   the wordmark
   *   green     4.73:1   a step behind us
   *   amber     5.13:1   the step in hand
   *   ahead     3.18:1   a step not started, which still has to be visible
   *
   * The rail ahead is `line`, which is far below 3:1 on purpose: it is a connector, and
   * the node it leads to carries the state.
   */
  // The card's own background. Not part of the palette below, which is foregrounds only.
  const CARD_BG = '#faf7f5';

  const LIGHT = {
    ink: '#191716',
    body: '#3d3734',
    muted: '#665e59',
    mark: '#8f5a5a',
    done: '#2E7D4F',
    now: '#9A5A00',
    ahead: '#968981',
    rail: '#e8e0db',
    stopped: '#d22b1e',
  };

  /**
   * The Dynamic Island, which is always black and never ours to tint. Same hues, lifted
   * for a dark surface: the cream-tuned green and amber drop to about 4:1 there and go
   * muddy, while these clear 10:1.
   */
  const DARK = {
    ink: '#FFFFFF',
    body: '#FFFFFF',
    muted: '#EBEBF5',
    mark: '#EBEBF5',
    done: '#30D158',
    now: '#FF9F0A',
    ahead: '#8E8E93',
    rail: '#48484A',
    stopped: '#FF453A',
  };

  /**
   * A cancelled order has no step in hand, so nothing is the frontier. Without the
   * `cancelled` check it would light its first node, since `done` is zero either way.
   */
  const stateOf = (index: number) => {
    if (done > index) return 'done';
    if (!props.cancelled && done === index) return 'now';
    return 'ahead';
  };

  /**
   * Size carries the same information as colour, because colour alone is not a signal
   * everyone can read: green and amber sit one step apart under deuteranopia, which is
   * roughly one man in twelve. A step not started is smaller as well as quieter.
   */
  const node = (index: number, c: typeof LIGHT) => {
    const state = stateOf(index);
    const size = state === 'ahead' ? 7 : 10;
    const tint = state === 'done' ? c.done : state === 'now' ? c.now : c.ahead;
    return <Circle modifiers={[frame({ width: size, height: size }), foregroundStyle(tint)]} />;
  };

  /**
   * The leg leading into a node, which takes that node's colour: legs already travelled
   * read green, the leg being travelled reads amber. The track becomes a path rather than
   * three unrelated pips.
   *
   * Shapes are flexible in SwiftUI, so this takes whatever width the row has left - which
   * is what keeps the three labels under their own nodes at every text size.
   */
  const rail = (into: number, c: typeof LIGHT) => {
    const state = stateOf(into);
    const tint = state === 'done' ? c.done : state === 'now' ? c.now : c.rail;
    return <Capsule modifiers={[frame({ height: 2 }), foregroundStyle(tint)]} />;
  };

  const label = (index: number, text: string, c: typeof LIGHT) => (
    <Text
      modifiers={[
        font({ size: 10, weight: done > index ? 'semibold' : 'regular' }),
        foregroundStyle(stateOf(index) === 'ahead' ? c.muted : c.ink),
      ]}
    >
      {text}
    </Text>
  );

  const track = (c: typeof LIGHT) => (
    <VStack spacing={7}>
      <HStack spacing={6} alignment="center">
        {node(0, c)}
        {rail(1, c)}
        {node(1, c)}
        {rail(2, c)}
        {node(2, c)}
      </HStack>
      <HStack>
        {label(0, props.steps[0], c)}
        <Spacer />
        {label(1, props.steps[1], c)}
        <Spacer />
        {label(2, props.steps[2], c)}
      </HStack>
    </VStack>
  );

  /** Red is for a cancelled order and nothing else. */
  const heading = (size: number, c: typeof LIGHT) => (
    <HStack>
      <Text
        modifiers={[
          font({ size, weight: 'semibold' }),
          foregroundStyle(props.cancelled ? c.stopped : c.ink),
        ]}
      >
        {props.status}
      </Text>
      <Spacer />
    </HStack>
  );

  const eta = (c: typeof LIGHT) =>
    props.eta ? (
      <HStack>
        <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(c.body)]}>
          {props.eta}
        </Text>
        <Spacer />
      </HStack>
    ) : null;

  const islandTint = props.cancelled ? DARK.stopped : done >= 3 ? DARK.done : DARK.now;

  return {
    // 14pt is the standard Lock Screen margin, which lines the card up with the
    // notifications above it. The whole thing has to stay under 160pt or the system
    // truncates it, which is why the name and the order number share a row.
    banner: (
      <VStack
        spacing={9}
        modifiers={[padding({ horizontal: 14, vertical: 14 }), activityBackgroundTint(CARD_BG)]}
      >
        <HStack>
          <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(LIGHT.mark)]}>
            {'GENOSYS MIDDLE EAST'}
          </Text>
          <Spacer />
          <Text modifiers={[font({ size: 11 }), foregroundStyle(LIGHT.muted)]}>
            {props.orderLabel || '#' + props.orderNumber}
          </Text>
        </HStack>

        {heading(17, LIGHT)}

        {eta(LIGHT)}

        {track(LIGHT)}

        {/* Rewards are a courtesy, not the news: quieter than the step labels above. */}
        {props.tier ? (
          <HStack>
            <Text modifiers={[font({ size: 10 }), foregroundStyle(LIGHT.muted)]}>{props.tier}</Text>
            <Spacer />
            {props.points ? (
              <Text modifiers={[font({ size: 10 }), foregroundStyle(LIGHT.muted)]}>
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
      <Text modifiers={[font({ size: 12 }), foregroundStyle(DARK.ink)]}>{done + '/3'}</Text>
    ),
    minimal: (
      <Text modifiers={[font({ size: 12 }), foregroundStyle(islandTint)]}>{'\u25CF'}</Text>
    ),

    expandedLeading: (
      <VStack modifiers={[padding({ all: 10 })]}>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(DARK.muted)]}>
          {props.orderLabel || '#' + props.orderNumber}
        </Text>
      </VStack>
    ),
    expandedTrailing: (
      <VStack modifiers={[padding({ all: 10 })]}>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(DARK.muted)]}>{done + '/3'}</Text>
      </VStack>
    ),
    expandedBottom: (
      <VStack spacing={9} modifiers={[padding({ horizontal: 14, bottom: 12 })]}>
        {heading(15, DARK)}
        {eta(DARK)}
        {track(DARK)}
      </VStack>
    ),
  };
};

export default createLiveActivity('OrderActivity', OrderActivity);
