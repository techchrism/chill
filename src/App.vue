<template>
    <v-app>
        <v-app-bar app color="primary" >
            <v-toolbar-title class="headline text-uppercase">
                <span class="font-weight-light">Chill</span>
            </v-toolbar-title>
            <v-spacer/>
            <controls :sounds="soundMeta"
                      :source-name="selectedAnimation.source"
                      :progress="songProgress"
                      :song-name="selectedSong.name"
                      :artist="selectedSong.artist"
                      @nextGif="nextAnimation"
                      @prevGif="prevAnimation"
                      @randomGif="pickRandomAnimation"
                      @nextSong="nextSong"
                      @prevSong="prevSong"
                      @toggleSong="toggleSong"
                      @setVolume="setVolume($event.name, $event.value)"
                      ref="controls"
            >
                <template v-slot:activator="{on}">
                    <v-btn v-on="on" icon>
                        <v-icon>mdi-cog</v-icon>
                    </v-btn>
                </template>
            </controls>
            <v-btn icon @click="fullscreen">
                <v-icon>mdi-fullscreen</v-icon>
            </v-btn>
        </v-app-bar>

        <v-content>
            <div ref="content" class="full-container">
                <animation :source="animationSource"/>
            </div>
            <audio :src="musicSource"
                   @ended="pickRandomSong(true)"
                   @timeupdate="timeUpdate"
                   onload="this.play()"
                   ref="music"
            ></audio>

            <v-snackbar :value="autoplayDisabled" :timeout="0">
                AutoPlay is disabled. Click anywhere to enable.
            </v-snackbar>
        </v-content>
    </v-app>
</template>

<script>
    import Controls from './components/Controls';
    import Animation from './components/Animation';
    import fscreen from 'fscreen';
    import {mapState} from 'vuex';
    import {sounds, animations, music} from './files';
    import {Howl, Howler} from 'howler';

    export default {
        name: 'App',
        components: {Animation, Controls},
        data()
        {
            return {
                soundMeta: sounds,
                animations,
                music,
                soundsHowler: {},
                musicPlaying: true,
                selectedAnimation: {},
                selectedSong: {},
                songProgress: 0,
                autoplayDisabled: false
            };
        },
        computed: {
            animationSource()
            {
                return 'img/gifs/' + this.selectedAnimation.file;
            },
            musicSource()
            {
                return 'music/' + this.selectedSong.file;
            },
            ...mapState(['volumes'])
        },
        watch: {
            volumes(newVolumes)
            {
                for(let vol in newVolumes)
                {
                    if(!newVolumes.hasOwnProperty(vol))
                    {
                        continue;
                    }
                    this.setVolume(vol, newVolumes[vol]);
                }
            }
        },
        methods: {
            setVolume(name, volume)
            {
                let sound = this.soundsHowler[name];
                sound.volume(volume / 100);
                if(volume !== 0 && !sound.playing())
                {
                    sound.play();
                }
                else if(volume === 0 && sound.playing())
                {
                    sound.pause();
                }
            },
            pickRandomAnimation()
            {
                this.selectedAnimation = this.animations[Math.floor(Math.random() * this.animations.length)];
            },
            nextAnimation()
            {
                const index = this.animations.indexOf(this.selectedAnimation);
                if(index === this.animations.length - 1)
                {
                    this.selectedAnimation = this.animations[0];
                }
                else
                {
                    this.selectedAnimation = this.animations[index + 1];
                }
            },
            prevAnimation()
            {
                const index = this.animations.indexOf(this.selectedAnimation);
                if(index === 0)
                {
                    this.selectedAnimation = this.animations[this.animations.length - 1];
                }
                else
                {
                    this.selectedAnimation = this.animations[index - 1];
                }
            },
            pickRandomSong(ended)
            {
                const selectedIndex = this.music.indexOf(this.selectedSong);
                let randomNum = Math.floor(Math.random() * this.music.length);
                while(randomNum === selectedIndex)
                {
                    randomNum = Math.floor(Math.random() * this.music.length)
                }
                this.selectedSong = this.music[randomNum];
                if(ended)
                {
                    setTimeout(() =>
                    {
                        this.$refs['music'].play();
                    }, 5);
                }
            },
            nextSong()
            {
                const index = this.music.indexOf(this.selectedSong);
                if(index === this.music.length - 1)
                {
                    this.selectedSong = this.music[0];
                }
                else
                {
                    this.selectedSong = this.music[index + 1];
                }
                setTimeout(() =>
                {
                    this.$refs['music'].play();
                }, 5);
            },
            prevSong()
            {
                const index = this.music.indexOf(this.selectedSong);
                if(index === 0)
                {
                    this.selectedSong = this.music[this.music.length - 1];
                }
                else
                {
                    this.selectedSong = this.music[index - 1];
                }
                setTimeout(() =>
                {
                    this.$refs['music'].play();
                }, 5);
            },
            handleAutoplayClick()
            {
                this.autoplayDisabled = false;
                document.removeEventListener('click', this.handleAutoplayClick);
                this.$refs['music'].play();
                for(let sound in this.soundsHowler)
                {
                    if(!this.soundsHowler.hasOwnProperty(sound))
                    {
                        continue;
                    }

                    if(this.soundsHowler[sound].volume > 0.0)
                    {
                        this.soundsHowler[sound].play();
                    }
                }
            },
            toggleSong()
            {
                const mus = this.$refs['music'];
                if(mus.paused)
                {
                    mus.play();
                }
                else
                {
                    mus.pause();
                }
                this.$store.commit('setMusicPlaying', !mus.paused);
            },
            timeUpdate()
            {
                this.songProgress = (this.$refs['music'].currentTime / this.$refs['music'].duration) * 100;
            },
            fullscreen()
            {
                fscreen.requestFullscreen(this.$refs['content']);
            },
            keydown(e)
            {
                switch(e.keyCode)
                {
                    case 32: // space
                    {
                        this.nextAnimation();
                        break;
                    }
                    case 37: // left
                    {
                        this.prevAnimation();
                        break;
                    }
                    case 38: // up
                    {
                        this.nextSong();
                        break;
                    }
                    case 39: // right
                    {
                        this.nextAnimation();
                        break;
                    }
                    case 40: // down
                    {
                        this.prevSong();
                        break;
                    }
                    default: return;
                }
                e.preventDefault();
            }
        },
        mounted()
        {
            this.pickRandomAnimation();
            this.pickRandomSong();

            for(let sound of sounds)
            {
                this.soundsHowler[sound.name] = new Howl({
                    src: 'sound/' + sound.file,
                    loop: true,
                    autoplay: false,
                    html5: true,
                    volume: this.volumes[sound.name] || 0.0
                });
            }

            setTimeout(() =>
            {
                this.$refs['music'].play().then(() =>
                {
                    for(let sound in this.soundsHowler)
                    {
                        if(!this.soundsHowler.hasOwnProperty(sound))
                        {
                            continue;
                        }

                        if(this.soundsHowler[sound].volume > 0)
                        {
                            this.soundsHowler[sound].play();
                        }
                    }
                }).catch(() =>
                {
                    this.autoplayDisabled = true;
                    document.addEventListener('click', this.handleAutoplayClick);
                });
            }, 15);


            document.addEventListener('keydown', this.keydown);
        }
    };
</script>

<style>
    html {
        overflow-y: auto !important;
    }

    .full-container
    {
        height: 100%;
        width: 100%;
    }
</style>
