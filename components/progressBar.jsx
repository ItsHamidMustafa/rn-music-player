import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { AudioContext } from '../context/AudioContext';

const TrackProgress = () => {
  const { getCurrentPosition, getDuration, isPlaying, soundRef } = useContext(AudioContext); // Access soundRef from context
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const updateProgress = async () => {
      const currentPosition = await getCurrentPosition();
      const trackDuration = await getDuration();
      setPosition(currentPosition);
      setDuration(trackDuration);
    };

    const interval = setInterval(() => {
      if (isPlaying) {
        updateProgress();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSeek = async (value) => {
    const seekPosition = value * duration; // Convert to milliseconds
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(seekPosition);
      console.log('Seeked to:', seekPosition);
    }
  };

  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        maximumTrackTintColor='rgb(255,255,255)'
        minimumTrackTintColor='rgb(0, 170, 156)'
        value={duration ? position / duration : 0}
        onSlidingComplete={handleSeek} // Use onSlidingComplete instead of onValueChange
      />
      <Text style={styles.time}>{`${Math.floor(position / 1000)} / ${Math.floor(duration / 1000)} sec`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
    width: '100%'
  },
  slider: {
    width: '100%',
    height: 40,
  },
  time: {
    color: 'white',
    marginBottom: 10,
  },
});

export default TrackProgress;