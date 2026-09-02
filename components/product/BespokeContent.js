/**
 * The editorial product copy, as written for the website.
 *
 * The catalogue's best writing - the claims checked against the Intertek
 * dossier, the ingredient figures, the "look elsewhere if" lists - lived only in
 * the website's bespoke pages, so a clinic opening the same product in the app
 * saw a much thinner version of it. The API now sends that copy as blocks; this
 * draws them.
 *
 * A block carries whichever of eight parts it happens to have: an intro, a body,
 * title/body cards, label/value rows, bullets, a for/against pair, questions and
 * a closing note. Every product's sections reduce to those, so nothing here
 * knows what a sunscreen or a peel is, and a section invented next month
 * arrives without this file changing.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CollapsibleSection from './CollapsibleSection';
import T from '../../utils/typography';
import { colors, shadow, surfaces } from '../../utils/theme';

/**
 * Which icon fronts a section. Unlisted keys get the neutral one rather than a
 * decorative pick, so an icon always means something.
 */
const ICONS = {
  solution: 'flask-outline',
  working: 'flask-outline',
  science: 'flask-outline',
  functions: 'flask-outline',
  effects: 'sparkles-outline',
  mechanism: 'flask-outline',
  engine: 'color-filter-outline',
  complex: 'color-filter-outline',
  actives: 'leaf-outline',
  formula: 'leaf-outline',
  inci: 'leaf-outline',
  filters: 'sunny-outline',
  fragrance: 'rose-outline',
  shadeSection: 'color-palette-outline',
  wear: 'time-outline',
  timeline: 'calendar-outline',
  clinical: 'analytics-outline',
  proof: 'analytics-outline',
  lab: 'beaker-outline',
  quality: 'shield-checkmark-outline',
  clean: 'checkmark-circle-outline',
  freeFrom: 'checkmark-circle-outline',
  howTo: 'list-outline',
  sizes: 'resize-outline',
  range: 'grid-outline',
  suited: 'people-outline',
  safety: 'alert-circle-outline',
  spec: 'information-circle-outline',
  details: 'information-circle-outline',
  faq: 'help-circle-outline',
  closing: 'chatbox-ellipses-outline',
};

/** The first two sections open, since a wall of shut rows invites no one in. */
const OPEN_BY_DEFAULT = 2;

function Paragraph({ children, isRTL, style }) {
  if (!children) return null;
  return <Text style={[styles.body, isRTL && styles.rtl, style]}>{children}</Text>;
}

function Bullets({ items, isRTL }) {
  if (!items?.length) return null;
  return (
    <View style={styles.group}>
      {items.map((item, index) => (
        <View key={`bullet-${index}`} style={[styles.bulletRow, isRTL && styles.rowRTL]}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={[styles.body, styles.bulletText, isRTL && styles.rtl]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Entries({ items, isRTL }) {
  if (!items?.length) return null;
  return (
    <View style={styles.group}>
      {items.map((entry, index) => (
        <View key={`entry-${index}`} style={styles.entry}>
          {entry.title ? (
            <Text style={[styles.entryTitle, isRTL && styles.rtl]}>{entry.title}</Text>
          ) : null}
          {entry.body ? (
            <Text style={[styles.body, isRTL && styles.rtl]}>{entry.body}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function Rows({ items, isRTL }) {
  if (!items?.length) return null;
  return (
    <View style={styles.rows}>
      {items.map((row, index) => (
        <View
          key={`row-${index}`}
          style={[styles.row, isRTL && styles.rowRTL, index === items.length - 1 && styles.rowLast]}
        >
          <Text style={[styles.rowLabel, isRTL && styles.rtl]}>{row.label}</Text>
          <Text style={[styles.rowValue, isRTL && styles.rtl]}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

function Lists({ items, isRTL }) {
  if (!items?.length) return null;
  return (
    <View style={styles.group}>
      {items.map((list, index) => (
        <View key={`list-${index}`} style={styles.entry}>
          {list.title ? (
            <Text style={[styles.entryTitle, isRTL && styles.rtl]}>{list.title}</Text>
          ) : null}
          <Bullets items={list.items} isRTL={isRTL} />
        </View>
      ))}
    </View>
  );
}

function Questions({ items, isRTL }) {
  if (!items?.length) return null;
  return (
    <View style={styles.group}>
      {items.map((qa, index) => (
        <View key={`qa-${index}`} style={styles.entry}>
          <Text style={[styles.entryTitle, isRTL && styles.rtl]}>{qa.question}</Text>
          <Text style={[styles.body, isRTL && styles.rtl]}>{qa.answer}</Text>
        </View>
      ))}
    </View>
  );
}

function Block({ block, index, isRTL }) {
  const title = block.title || block.eyebrow;
  if (!title) return null;
  return (
    <CollapsibleSection
      title={title}
      icon={ICONS[block.key] || 'ellipse-outline'}
      iconColor={colors.accent}
      defaultOpen={index < OPEN_BY_DEFAULT}
      isRTL={isRTL}
    >
      {block.eyebrow && block.title ? (
        <Text style={[styles.eyebrow, isRTL && styles.rtl]}>{block.eyebrow}</Text>
      ) : null}
      <Paragraph isRTL={isRTL}>{block.intro}</Paragraph>
      <Paragraph isRTL={isRTL} style={block.intro ? styles.spaced : null}>
        {block.body}
      </Paragraph>
      <Entries items={block.entries} isRTL={isRTL} />
      <Bullets items={block.bullets} isRTL={isRTL} />
      <Lists items={block.lists} isRTL={isRTL} />
      <Rows items={block.rows} isRTL={isRTL} />
      <Questions items={block.questions} isRTL={isRTL} />
      {block.note ? (
        <Text style={[styles.note, isRTL && styles.rtl]}>{block.note}</Text>
      ) : null}
      {block.disclaimer ? (
        <Text style={[styles.disclaimer, isRTL && styles.rtl]}>{block.disclaimer}</Text>
      ) : null}
    </CollapsibleSection>
  );
}

/** The headline, promise bullets and figures that open the website's page. */
export function BespokeHero({ content, isRTL = false }) {
  if (!content) return null;
  const { headline, subheadline, heroBullets, stats } = content;
  if (!headline && !subheadline && !heroBullets?.length && !stats?.length) return null;

  return (
    <View style={[styles.hero, shadow.card]}>
      {content.eyebrow ? (
        <Text style={[styles.eyebrow, isRTL && styles.rtl]}>{content.eyebrow}</Text>
      ) : null}
      {headline ? (
        <Text style={[styles.headline, isRTL && styles.rtlSerif]}>{headline}</Text>
      ) : null}
      {subheadline ? (
        <Text style={[styles.body, styles.spaced, isRTL && styles.rtl]}>{subheadline}</Text>
      ) : null}
      <Bullets items={heroBullets} isRTL={isRTL} />
      {stats?.length ? (
        <View style={styles.stats}>
          {stats.map((stat, index) => (
            <View key={`stat-${index}`} style={styles.stat}>
              <Text style={[styles.statValue, isRTL && styles.rtl]}>{stat.label}</Text>
              <Text style={[styles.statLabel, isRTL && styles.rtl]}>{stat.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function BespokeContent({ content, isRTL = false }) {
  if (!content?.blocks?.length) return null;
  return (
    <>
      {content.blocks.map((block, index) => (
        <Block key={block.key} block={block} index={index} isRTL={isRTL} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    ...surfaces.card,
    padding: 20,
    marginBottom: 14,
  },
  eyebrow: {
    ...T.eyebrow,
    marginBottom: 6,
  },
  headline: {
    ...T.serifTitle,
    color: colors.label,
    marginBottom: 2,
  },
  body: {
    ...T.body,
    color: colors.bodyText,
    lineHeight: 22,
  },
  spaced: {
    marginTop: 10,
  },
  group: {
    marginTop: 12,
    gap: 10,
  },
  entry: {
    gap: 4,
  },
  entryTitle: {
    ...T.label,
    fontWeight: '700',
    color: colors.label,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  bulletDot: {
    ...T.body,
    color: colors.accent,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
  },
  rows: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    ...T.bodySmall,
    color: colors.mutedText,
    flex: 1,
  },
  rowValue: {
    ...T.bodySmall,
    color: colors.label,
    fontWeight: '600',
    flex: 1.4,
  },
  note: {
    ...T.bodySmall,
    color: colors.mutedText,
    marginTop: 12,
    lineHeight: 20,
  },
  disclaimer: {
    ...T.caption,
    color: colors.secondaryLabel,
    marginTop: 8,
    lineHeight: 18,
  },
  stats: {
    marginTop: 14,
    gap: 10,
  },
  stat: {
    gap: 2,
  },
  statValue: {
    ...T.serifHeading,
    color: colors.accent,
  },
  statLabel: {
    ...T.bodySmall,
    color: colors.mutedText,
    lineHeight: 20,
  },
  rtl: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  // Cormorant Garamond carries no Arabic glyphs, so Arabic falls back to the
  // system face rather than rendering in a substituted one.
  rtlSerif: {
    textAlign: 'right',
    writingDirection: 'rtl',
    fontFamily: undefined,
  },
});
