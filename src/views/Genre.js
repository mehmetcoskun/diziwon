import React, { useEffect, useState, useCallback } from 'react';
import {
    RefreshControl,
    ScrollView,
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    Text,
    View,
} from 'react-native';

// React Navigation
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Expo
import { LinearGradient } from 'expo-linear-gradient';

// Apollo
import { useQuery } from 'react-apollo';

// Store
import { store } from '../store';

// Queries
import { getDatasQuery, getUser } from '../queries';

// Components
import ToggleWatchListButton from '../components/ToggleWatchListButton';
import PlayButton from '../components/PlayButton';
import Header from '../components/Header';
import Menu from '../components/HeaderMenu/GenreMenu';
import HorizontalList from '../components/HorizontalList';

// Icons
import * as Icon from '../components/icons';

const wait = (timeout) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
};

export default function Genre({ route, navigation }) {
    const { genre } = route.params;

    const [refreshing, setRefreshing] = useState(false);
    const [datas, setDatas] = useState({});
    const [activeGenre, setActiveGenre] = useState(genre);

    const {
        error,
        data,
        refetch: refetchUser,
    } = useQuery(getUser, {
        variables: {
            token: store.token,
        },
    });

    const { data: LastData, refetch: refetchLastData } = useQuery(
        getDatasQuery,
        {
            variables: {
                limit: 1,
                random: true,
                genre: activeGenre,
            },
        }
    );

    useEffect(() => {
        setDatas(LastData?.datas[0]);
    }, [LastData]);

    const isFocused = useIsFocused();
    useEffect(() => {
        if (isFocused) {
            if (store.connection === false) {
                navigation.goBack();
                if (Platform.OS == 'ios') {
                    Alert.alert(
                        'Bazı bilgiler yüklenemedi. Lütfen yeniden deneyin.'
                    );
                } else if (Platform.OS == 'android') {
                    ToastAndroid.show(
                        'Bazı bilgiler yüklenemedi. Lütfen yeniden deneyin.',
                        ToastAndroid.SHORT
                    );
                }
            }
        }
    }, [isFocused]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        refetchLastData();
        refetchUser();

        wait(500).then(() => setRefreshing(false));
    }, []);

    return (
        <SafeAreaView>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        title="Yükleniyor.."
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,10.5)']}
                        style={[
                            StyleSheet.absoluteFillObject,
                            {
                                borderRadius: 1,
                                transform: [{ rotate: '180deg' }],
                                height: 200,
                            },
                        ]}
                    />
                    <Header navigation={navigation} />
                    <Menu
                        setActiveGenre={setActiveGenre}
                        activeGenre={activeGenre}
                        navigation={navigation}
                    />
                </View>
                <ImageBackground
                    style={styles.imageContainer}
                    source={{
                        uri: datas?.poster,
                    }}
                >
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,10.5)']}
                        style={[
                            StyleSheet.absoluteFillObject,
                            { borderRadius: 1 },
                        ]}
                    />
                    <Text style={styles.title}>
                        {datas?.title == null
                            ? datas?.original_title
                            : datas?.title}
                    </Text>
                    <View style={styles.buttons}>
                        <ToggleWatchListButton
                            id={datas?.id}
                            iconStyle={styles.buttonList}
                            textStyle={styles.buttonText}
                        />
                        <PlayButton
                            style={styles.buttonPlay}
                            navigation={navigation}
                            id={datas?.id}
                            type={datas?.type}
                        >
                            <Icon.Play color="black" />
                            <Text style={styles.buttonPlayText}>Oynat</Text>
                        </PlayButton>
                        <TouchableOpacity
                            style={styles.buttonInfo}
                            onPress={() => {
                                navigation.navigate(
                                    datas?.type == 'movie'
                                        ? 'MovieDetail'
                                        : 'SeriesDetail',
                                    {
                                        id: datas?.id,
                                        title:
                                            datas?.title == null
                                                ? datas?.original_title
                                                : datas?.title,
                                    }
                                );
                            }}
                        >
                            <Icon.Info fill="white" width={20} height={20} />
                            <Text style={styles.buttonText}>Bilgi</Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
                <View>
                    <HorizontalList
                        menuTitle="Diziwon'da Popüler"
                        query={getDatasQuery}
                        variables={{
                            limit: 10,
                            featured: 'DESC',
                            genre: activeGenre,
                        }}
                        navigation={navigation}
                        refreshing={refreshing}
                    />
                    <HorizontalList
                        menuTitle="Son Eklenenler"
                        query={getDatasQuery}
                        variables={{
                            limit: 10,
                            sort: 'DESC',
                            genre: activeGenre,
                        }}
                        navigation={navigation}
                        refreshing={refreshing}
                    />
                    <HorizontalList
                        menuTitle={
                            store.user.full_name + ' İçin En İyi Seçimler'
                        }
                        query={getDatasQuery}
                        variables={{
                            limit: 10,
                            random: true,
                            genre: activeGenre,
                        }}
                        navigation={navigation}
                        refreshing={refreshing}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
        flexDirection: 'column',
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        zIndex: 1,
    },
    imageContainer: {
        height: 550,
        marginBottom: 25,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonList: {
        alignItems: 'center',
        margin: 20,
    },
    buttonPlay: {
        margin: 30,
        backgroundColor: 'white',
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonInfo: {
        alignItems: 'center',
        margin: 20,
    },
    title: {
        fontSize: 26,
        color: 'white',
        textAlign: 'center',
        marginLeft: 10,
        marginRight: 10,
        fontFamily: 'AktifoBBlack',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        marginTop: 6,
        fontSize: 12,
    },
    buttonPlayText: {
        fontSize: 18,
        marginLeft: 10,
        fontWeight: 'bold',
    },
});
