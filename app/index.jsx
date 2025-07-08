import { useContext, useEffect, useRef } from "react";
import { View, Animated, TouchableOpacity, Text, StyleSheet, StatusBar, Easing, SafeAreaView, ImageBackground } from "react-native";
import { playerImage } from "@/constants/playerImages";
import { useRouter } from "expo-router";
import { AudioContext } from "../context/AudioContext";
import TrackProgress from '../components/progressBar';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Index() {
  const { pauseAudio, currentTrack, isPlaying, resumeAudio, repeat, toggleRepeat, playNextTrack, playPreviousTrack } = useContext(AudioContext);
  const router = useRouter();

  const rotation = useRef(new Animated.Value(0)).current;
  const animatedLoop = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      rotation.setValue(0);
      animatedLoop.current = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 10000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animatedLoop.current.start();
    } else {
      animatedLoop.current?.stop();
    }
  }, [isPlaying]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <ImageBackground
      source={playerImage}
      resizeMode='cover'
      style={styles.image}
      blurRadius={25}
    >
      <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />
      <SafeAreaView style={styles.container}>
        <StatusBar hidden={true} />
        <View style={styles.trackInfoContainer}>
          <Text style={styles.heading}>{currentTrack?.split("/").pop().slice(0, -4)}</Text>
          <Animated.Image
            source={playerImage}
            style={[styles.trackImage, { transform: [{ rotate: rotateInterpolate }] }]}
          />
          {isPlaying && <TrackProgress />}
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity onPress={playPreviousTrack} style={styles.controlButton}>
              <Text style={{ textAlign: 'center' }}><MaterialIcons name="navigate-before" size={24} color="white" /></Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={isPlaying ? pauseAudio : resumeAudio} style={styles.controlButton}>
              <Text style={{ textAlign: 'center' }}>{isPlaying ? <AntDesign name="pause" size={24} color="white" /> : <SimpleLineIcons name="control-play" size={24} color="white" />}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={playNextTrack} style={styles.controlButton}>
              <Text style={{ textAlign: 'center' }}><MaterialIcons name="navigate-next" size={24} color="white" /></Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity onPress={() => router.push("/playlist")} style={styles.bottomButton}>
            <Text style={{ textAlign: 'center' }}><SimpleLineIcons name="playlist" size={24} color="white" /></Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomButton} onPress={toggleRepeat}>
            <Text style={{ textAlign: 'center' }}>{repeat ? <MaterialCommunityIcons name="repeat" size={24} color="white" /> : <MaterialCommunityIcons name="repeat-off" size={24} color="white" />}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: 'space-between',
    paddingVertical: 25,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    height: '100%',
    width: '100%',
    zIndex: 0
  },
  image: {
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trackImage: {
    height: 200,
    width: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'white',
  },
  trackInfoContainer: {
    width: '90%',
    height: '90%',
    justifyContent: 'space-between',
    padding: 50,
    gap: 20,
    alignItems: 'center'
  },
  heading: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 10,
    textAlign: 'center',
    width: 300,
    color: 'rgb(255,255,255)',
    textShadowColor: 'rgb(0,0,0)',
    textShadowOffset: 20,
  },
  bottomButton: {
    padding: 15,
    backgroundColor: "rgba(189, 189, 189, 0.15)",
    borderRadius: 15,
    width: '45%',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  controlButton: {
    backgroundColor: "rgba(189, 189, 189, 0.15)",
    borderRadius: 50,
    padding: 25,
    justifyContent: 'center',
  }
});