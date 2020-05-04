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
                      :volumes="volumes"
                      :music-playing="musicPlaying"
                      :use-default="useDefault"
                      @nextGif="nextAnimation"
                      @prevGif="prevAnimation"
                      @randomGif="pickRandomAnimation"
                      @nextSong="nextSong"
                      @prevSong="prevSong"
                      @toggleSong="toggleSong"
                      @setVolume="setVolume($event.name, $event.value)"
                      @setDefault="setUseDefault"
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
            <div ref="content" class="full-container no-select">
                <animation :source="animationSource" :animation="selectedAnimation"/>
            </div>
            <audio @ended="pickRandomSong(true)"
                   onload="this.play()"
                   ref="music"
            >
                <source v-for="source of musicSources" :src="source">
            </audio>

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
    import {sounds, animations, music} from './files';
    import {Howl} from 'howler';
    import localforage from 'localforage';
    require('localforage-getitems');
    const throttle = require('lodash.throttle');

    localforage.config({
        name: 'chill'
    });

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
                volumes: {},
                volumesBackup: {},
                musicPlaying: true,
                selectedAnimation: {},
                selectedSong: {files:[]},
                songProgress: 0,
                autoplayDisabled: false,
                useDefault: true,
                ready: false
            };
        },
        computed: {
            animationSource()
            {
                return 'img/gifs/' + this.selectedAnimation.file;
            },
            musicSources()
            {
                return this.selectedSong.files.map((file) => 'music/' + file);
            },
            defaultVolumes()
            {
                return this.selectedAnimation.sounds || {};
            }
        },
        watch: {
            selectedAnimation()
            {
                if(this.useDefault && this.ready)
                {
                    for(let sound of sounds)
                    {
                        let volume = (this.defaultVolumes[sound.name] / 100) || 0.0;
                        this.setVolumeFor(sound.name, volume);
                    }
                    this.$refs['music'].volume = (this.defaultVolumes['Music'] / 100) || 1.0;
                }
            }
        },
        methods: {
            setVolumeFor(name, volume)
            {
                let howler = this.soundsHowler[name];
                howler.volume(volume);
                if(volume !== 0 && !howler.playing())
                {
                    if(howler.state() === 'unloaded')
                    {
                        howler.load();
                        howler.once('load', () =>
                        {
                            if(!howler.playing())
                            {
                                howler.play();
                            }
                        });
                    }
                    else
                    {
                        howler.play();
                    }
                }
                else if(volume === 0 && howler.playing())
                {
                    howler.pause();
                    howler.unload();
                }
            },
            clickHandler(e)
            {
                if(this.autoplayDisabled)
                {
                    return;
                }
                if(e.clientX > (window.innerWidth / 2))
                {
                    this.nextAnimation();
                }
                else
                {
                    this.prevAnimation();
                }
            },
            saveVolume: throttle(function()
            {
                localforage.setItem('volumes', this.volumes);
            }, 1000),
            setUseDefault(useDefault)
            {
                this.useDefault = useDefault;
                localforage.setItem('useDefault', useDefault);
                if(useDefault)
                {
                    this.volumesBackup = this.volumes;
                    this.volumes = this.defaultVolumes;
                }
                else
                {
                    this.volumes = this.volumesBackup;
                }

                for(let sound of sounds)
                {
                    this.setVolumeFor(sound.name, (this.volumes[sound.name] / 100) || 0.0)
                }
                this.$refs['music'].volume = (this.volumes['Music'] / 100) || 0.0;
            },
            setVolume(name, volume)
            {
                console.log('Setting volume');
                if(name !== 'Music')
                {
                    this.setVolumeFor(name, volume / 100);
                }
                else
                {
                    this.$refs['music'].volume = (volume / 100);
                }
                this.volumes[name] = volume;

                if(!this.useDefault)
                {
                    this.saveVolume();
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
                        this.$refs['music'].load();
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
                    this.$refs['music'].load();
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
                    this.$refs['music'].load();
                    this.$refs['music'].play();
                }, 5);
            },
            handleAutoplayClick()
            {
                this.autoplayDisabled = false;
                document.removeEventListener('click', this.handleAutoplayClick);
                if(this.musicPlaying)
                {
                    this.$refs['music'].play();
                }
                for(let sound in this.soundsHowler)
                {
                    if(!this.soundsHowler.hasOwnProperty(sound))
                    {
                        continue;
                    }

                    if(this.soundsHowler[sound].volume() > 0)
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
                this.musicPlaying = !mus.paused;
                localforage.setItem('musicPlaying', this.musicPlaying);
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

            localforage.getItems(['volumes', 'musicPlaying', 'useDefault']).then(({volumes, musicPlaying, useDefault}) =>
            {
                volumes = volumes || {};
                this.volumes = volumes;
                if(musicPlaying === null)
                {
                    musicPlaying = true;
                }
                this.musicPlaying = musicPlaying;
                if(useDefault === null)
                {
                    useDefault = true;
                }
                this.useDefault = useDefault;
                if(useDefault)
                {
                    this.volumesBackup = this.volumes;
                    this.volumes = this.defaultVolumes;
                }

                for(let sound of sounds)
                {
                    let volume = (this.volumes[sound.name] / 100) || 0.0;
                    this.soundsHowler[sound.name] = new Howl({
                        src: sound.files.map((file) => 'sound/' + file),
                        loop: true,
                        autoplay: false,
                        preload: false,
                        html5: true,
                        volume,
                        onplayerror: () =>
                        {
                            if(!this.autoplayDisabled)
                            {
                                this.autoplayDisabled = true;
                                document.addEventListener('click', this.handleAutoplayClick);
                            }
                        }
                    });

                    if(volume > 0)
                    {
                        this.soundsHowler[sound.name].load();
                        this.soundsHowler[sound.name].once('load', () =>
                        {
                            this.soundsHowler[sound.name].play();
                        });
                    }
                }

                this.$refs['music'].volume = (this.volumes['Music'] / 100) || 1.0;
                if(musicPlaying)
                {
                    this.$refs['music'].play().then(() =>
                    {

                    }).catch(() =>
                    {
                        if(!this.autoplayDisabled)
                        {
                            this.autoplayDisabled = true;
                            document.addEventListener('click', this.handleAutoplayClick);
                        }
                    });
                }

                this.ready = true;
            });

            document.addEventListener('keydown', this.keydown);
            this.$refs['content'].addEventListener('click', this.clickHandler);

            setInterval(() =>
            {
                requestAnimationFrame(() =>
                {
                    this.timeUpdate();
                });
            }, 250);
        }
    };
</script>

<style>
    html
    {
        overflow-y: auto !important;
    }

    .full-container
    {
        height: 100%;
        width: 100%;
    }

    .no-select
    {
        -moz-user-select: none;
        -khtml-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
</style>
