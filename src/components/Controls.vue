<template>
    <v-bottom-sheet inset>
        <template v-slot:activator="{on}">
            <slot name="activator" v-bind:on="on"></slot>
        </template>

        <v-card tile>
            <v-progress-linear :value="progress" class="my-0" height="3" color="red"/>

            <v-list>
                <v-list-item>
                    <v-list-item-icon>
                        <v-icon>mdi-music</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>{{songName}}</v-list-item-title>
                        <v-list-item-subtitle v-if="artist">{{artist}}</v-list-item-subtitle>
                    </v-list-item-content>

                    <v-spacer/>

                    <v-btn icon @click="$emit('prevSong')">
                        <v-icon>mdi-rewind</v-icon>
                    </v-btn>
                    <v-btn icon @click="$emit('toggleSong')" :class="{'mx-5': $vuetify.breakpoint.mdAndUp}">
                        <v-icon v-if="$store.state.musicPlaying">mdi-pause</v-icon>
                        <v-icon v-else>mdi-play</v-icon>
                    </v-btn>
                    <v-btn icon @click="$emit('nextSong')" class="ml-0" :class="{'mr-3': $vuetify.breakpoint.mdAndUp}">
                        <v-icon>mdi-fast-forward</v-icon>
                    </v-btn>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item>
                    <v-list-item-icon>
                        <v-icon>mdi-image</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title>Image from {{sourceName}}</v-list-item-title>
                    </v-list-item-content>

                    <v-spacer/>

                    <v-btn icon @click="$emit('nextGif')">
                        <v-icon>mdi-arrow-left-bold</v-icon>
                    </v-btn>
                    <v-btn icon @click="$emit('randomGif')" :class="{'mx-5': $vuetify.breakpoint.mdAndUp}">
                        <v-icon>mdi-shuffle</v-icon>
                    </v-btn>
                    <v-btn icon @click="$emit('prevGif')" class="ml-0" :class="{'mr-3': $vuetify.breakpoint.mdAndUp}">
                        <v-icon>mdi-arrow-right-bold</v-icon>
                    </v-btn>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item>
                    <v-list-item-icon>
                        <v-icon>mdi-pine-tree</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-row>
                            <template v-for="sound in sounds">
                                <v-col cols="4" sm="3">
                                    <v-slider :hint="sound.name"
                                              persistent-hint
                                              :value="$store.state.volumes[sound.name] || 0"
                                              @input="setVolume(sound.name, $event)"
                                    />
                                </v-col>
                            </template>
                        </v-row>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-card>
    </v-bottom-sheet>
</template>

<script>
    const throttle = require('lodash.throttle');

    export default {
        name: 'Controls',
        props: {
            sourceName: String,
            songName: String,
            artist: String,
            sounds: Array,
            progress: Number
        },
        methods: {
            commit: throttle(function(name, value)
            {
                this.$store.commit('setVolume', {name, value});
            }, 250),
            setVolume(name, value)
            {
                this.$emit('setVolume', {name, value});
                this.commit(name, value);
            }
        }
    };
</script>

<style scoped>

</style>
