import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const FADE_MS = 200;
// A clip that has not started by then (slow network, Low Power Mode) gives up its turn.
const START_TIMEOUT_MS = 4000;

/**
 * One silent light sweep over a shop-grid card photo. Mounted only while the card has the turn
 * (see the shop grid's viewability handling): it plays once, fades in when the first frame is
 * moving, fades back to the photo at the end and calls onDone. Frame 1 of every card clip matches
 * the photo, so the fade is invisible. Mixes with other audio so it never interrupts music.
 */
// A failing clip must only drop the clip, never the shop grid around it.
class CardVideoBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onDone?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function CardVideo(props) {
  return (
    <CardVideoBoundary onDone={props.onDone}>
      <CardVideoPlayer {...props} />
    </CardVideoBoundary>
  );
}

function CardVideoPlayer({ uri, onDone }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const finished = useRef(false);

  const player = useVideoPlayer({ uri }, (p) => {
    p.muted = true;
    p.loop = false;
    p.audioMixingMode = 'mixWithOthers';
    p.play();
  });

  useEffect(() => {
    const finish = () => {
      if (finished.current) return;
      finished.current = true;
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(() => onDone?.());
    };
    const timeout = setTimeout(() => { if (!player.playing) finish(); }, START_TIMEOUT_MS);
    const playingSub = player.addListener('playingChange', ({ isPlaying }) => {
      if (isPlaying && !finished.current) {
        clearTimeout(timeout);
        Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver: true }).start();
      }
    });
    const endSub = player.addListener('playToEnd', finish);
    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'error') finish();
    });
    return () => {
      clearTimeout(timeout);
      playingSub.remove();
      endSub.remove();
      statusSub.remove();
    };
  }, [player, opacity, onDone]);

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        nativeControls={false}
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
        // SurfaceView ignores the parent's opacity on Android, so the fade needs a TextureView.
        surfaceType="textureView"
      />
    </Animated.View>
  );
}
