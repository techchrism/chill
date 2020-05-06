<template>
    <v-bottom-sheet inset scrollable>
        <template v-slot:activator="{on}">
            <slot name="activator" v-bind:on="on"></slot>
        </template>

        <v-card tile>
            <v-progress-linear :value="progress" class="my-0" height="3" color="red"/>

            <v-card-text>
                <v-list>
                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-music</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>{{songName}}</v-list-item-title>
                            <v-list-item-subtitle v-if="artist">{{artist}}</v-list-item-subtitle>
                        </v-list-item-content>

                        <template v-if="$vuetify.breakpoint.mdAndUp">
                            <v-spacer/>
                            <v-slider hide-details
                                      :prepend-icon="volumeClass"
                                      :value="volumes['Music'] || 0"
                                      @input="$emit('setVolume', {name: 'Music', value: $event})"
                            />
                            <v-spacer/>
                        </template>


                        <v-btn icon @click="$emit('prevSong')">
                            <v-icon>mdi-rewind</v-icon>
                        </v-btn>
                        <v-btn icon @click="$emit('toggleSong')" :class="{'mx-5': $vuetify.breakpoint.mdAndUp}">
                            <v-icon v-if="musicPlaying">mdi-pause</v-icon>
                            <v-icon v-else>mdi-play</v-icon>
                        </v-btn>
                        <v-btn icon @click="$emit('nextSong')" class="ml-0" :class="{'mr-3': $vuetify.breakpoint.mdAndUp}">
                            <v-icon>mdi-fast-forward</v-icon>
                        </v-btn>
                    </v-list-item>
                    <v-list-item v-if="$vuetify.breakpoint.smAndDown">
                        <v-spacer v-if="!$vuetify.breakpoint.xs"/>
                        <v-slider hide-details
                                  :prepend-icon="volumeClass"
                                  :value="volumes['Music'] || 0"
                                  @input="$emit('setVolume', {name: 'Music', value: $event})"
                        />
                        <v-spacer v-if="!$vuetify.breakpoint.xs"/>
                    </v-list-item>

                    <v-divider></v-divider>

                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-image</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>Image from {{sourceName}}</v-list-item-title>
                        </v-list-item-content>

                        <v-spacer v-if="$vuetify.breakpoint.mdAndUp"/>

                        <v-btn icon @click="$emit('prevGif')">
                            <v-icon>mdi-arrow-left-bold</v-icon>
                        </v-btn>
                        <v-btn icon @click="$emit('randomGif')" :class="{'mx-5': $vuetify.breakpoint.mdAndUp}">
                            <v-icon>mdi-shuffle</v-icon>
                        </v-btn>
                        <v-btn icon @click="$emit('nextGif')" class="ml-0" :class="{'mr-3': $vuetify.breakpoint.mdAndUp}">
                            <v-icon>mdi-arrow-right-bold</v-icon>
                        </v-btn>
                    </v-list-item>

                    <v-divider></v-divider>

                    <v-list-item>
                        <v-list-item-icon>
                            <v-icon>mdi-pine-tree</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-row justify="center">
                                <v-checkbox hide-details
                                            label="Use Default"
                                            class="mt-0"
                                            :input-value="useDefault"
                                            @change="$emit('setDefault', $event)"/>
                            </v-row>
                            <v-row justify="center">
                                <template v-for="sound in sounds">
                                    <v-col cols="12" md="3" sm="6">
                                        <v-slider :hint="sound.name"
                                                  persistent-hint
                                                  :value="volumes[sound.name]"
                                                  @input="$emit('setVolume', {name: sound.name, value: $event})"
                                        />
                                    </v-col>
                                </template>
                            </v-row>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>
    </v-bottom-sheet>
</template>

<script>
    export default {
        name: 'Controls',
        props: {
            sourceName: String,
            songName: String,
            artist: String,
            sounds: Array,
            progress: Number,
            volumes: Object,
            musicPlaying: Boolean,
            useDefault: Boolean
        },
        computed: {
            volumeClass()
            {
                let volume = this.volumes['Music'];
                if(volume === null)
                {
                    volume = 100;
                }
                if(volume > 60)
                {
                    return 'mdi mdi-volume-high';
                }
                else if(volume > 30)
                {
                    return 'mdi mdi-volume-medium'
                }
                else if(volume > 0)
                {
                    return 'mdi mdi-volume-low'
                }
                else
                {
                    return 'mdi mdi-volume-mute'
                }
            }
        }
    };
</script>

<style scoped>

</style>
