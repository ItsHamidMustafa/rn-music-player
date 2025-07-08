import { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, RefreshControl, ImageBackground } from "react-native";
import { AudioContext } from "../context/AudioContext";
import { playerImage } from "@/constants/playerImages";
import * as MediaLibrary from "expo-media-library";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Playlist() {
    const [musicFiles, setMusicFiles] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
    const { playAudio, currentTrack, setMusicFiles: setContextMusicFiles } = useContext(AudioContext);

    useEffect(() => {
        const loadMusicFiles = async () => {
            try {
                const storedMusic = await AsyncStorage.getItem("musicFiles");
                if (storedMusic) {
                    const parsedMusic = JSON.parse(storedMusic);
                    setMusicFiles(parsedMusic);
                    return;
                }
            } catch (error) {
                console.error("Error loading stored music files:", error);
            }
            fetchMusicFiles();
        };

        loadMusicFiles();
    }, []);

    const fetchMusicFiles = async () => {
        if (musicFiles.length > 0) return;

        try {
            if (!permissionResponse?.granted) {
                const { status } = await requestPermission();
                if (status !== "granted") {
                    console.warn("Permission not granted.");
                    return;
                }
            }

            const media = await MediaLibrary.getAssetsAsync({ mediaType: "audio", first: 100 });
            const sortedFiles = media.assets.sort((a, b) => a.filename.localeCompare(b.filename));

            setMusicFiles(sortedFiles);
            setContextMusicFiles(sortedFiles);
            await AsyncStorage.setItem("musicFiles", JSON.stringify(sortedFiles));
        } catch (error) {
            console.error("Error fetching music files:", error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchMusicFiles();
        setRefreshing(false);
    };

    return (
        <ImageBackground
            source={playerImage}
            resizeMode='cover'
            style={styles.image}
            blurRadius={25}
        >
            <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />
            <View style={styles.container}>
                <FlatList
                    ListFooterComponent={<Text style={{ textAlign: "center", color: 'rgb(255,255,255)' }}>End...!</Text>}
                    data={musicFiles}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => playAudio(item.uri)}
                            style={[styles.itemContainer, currentTrack === item.uri ? styles.activeTrack : {}]}
                        >
                            <Text style={{ color: 'rgb(255,255,255)' }}>{item.filename}</Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingVertical: 50 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: 'space-around',
        borderWidth: 1,
        borderColor: 'rgb(1,1,1)',
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
    itemContainer: {
        padding: 10,
        paddingVertical: 20,
        borderWidth: 1,
        borderColor: "rgba(1, 1, 1, 0.26)",
        marginBottom: 10,
        width: '95%',
        marginHorizontal: 'auto',
        borderRadius: 15,
        backgroundColor: 'rgba(189, 189, 189, 0.15)',
        justifyContent: 'space-between'
    },
    activeTrack: {
        backgroundColor: "rgb(0, 0, 0)"
    }
});
