import Vue from 'vue';
import Vuex from 'vuex';
import localForage from 'localforage';
import VuexPersistence from 'vuex-persist';

const vuexDB = new VuexPersistence({
    storage: localForage,
    key: 'vuex-chill'/*,
    reducer(state)
    {
        return {
            volumes: state.volumes,
            musicPlaying: state.musicPlaying
        };
    }*/
});

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        volumes: {},
        musicPlaying: true
    },
    mutations: {
        setVolume(state, {name, value})
        {
            state.volumes[name] = value;
        },
        setMusicPlaying(state, music)
        {
            state.musicPlaying = music;
        }
    },
    plugins: [vuexDB.plugin]
});
