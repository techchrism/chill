<template>
    <div class="full-container primary">
        <v-img class="full-container"
               :src="source"
               alt="Animation"
               ref="img"
               @load="onLoad"
               contain
        />
    </div>
</template>

<script>
    function componentToHex(c)
    {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }

    function rgbToHex(r, g, b)
    {
        return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    export default {
        name: 'Animation',
        props: {
            animation: Object,
            source: String
        },
        data()
        {
            return {}
        },
        watch: {
            animation()
            {
                if(this.animation.hasOwnProperty('color'))
                {
                    this.$vuetify.theme.dark = (this.animation.theme === 'dark');
                    this.$vuetify.theme.themes[this.animation.theme].primary = this.animation.color;
                }
            }
        },
        methods: {
            onLoad()
            {
                if(!this.animation.hasOwnProperty('color'))
                {
                    const {r, g, b} = this.getAverageColor();
                    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                    const contrast = (yiq >= 128) ? 'light' : 'dark';
                    this.$vuetify.theme.dark = (contrast === 'dark');
                    this.$vuetify.theme.themes[contrast].primary = rgbToHex(r, g, b);
                    console.log(this.source + ': ' + rgbToHex(r, g, b) + ' (' + contrast + ')');
                }
            },
            getAverageColor()
            {
                const imgEl = this.$refs['img'];
                const blockSize = 5,
                    defaultRGB = {r: 50, g: 100, b: 50},
                    canvas = document.createElement('canvas'),
                    context = canvas.getContext && canvas.getContext('2d');
                let data, width, height,
                    i = -4,
                    length;
                const rgb = {r: 0, g: 0, b: 0};
                let count = 0;

                if(!context)
                {
                    console.error('No context!');
                    return defaultRGB;
                }

                height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
                width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

                context.drawImage(imgEl, 0, 0);

                try
                {
                    data = context.getImageData(0, 0, width, height);
                }
                catch(e)
                {
                    console.error('Error!');
                    return defaultRGB;
                }

                length = data.data.length;

                while((i += blockSize * 4) < length)
                {
                    count++;
                    rgb.r += data.data[i];
                    rgb.g += data.data[i+1];
                    rgb.b += data.data[i+2];
                }

                rgb.r = ~~(rgb.r/count);
                rgb.g = ~~(rgb.g/count);
                rgb.b = ~~(rgb.b/count);

                return rgb;
            }
        },
        mounted()
        {
            if(this.animation.hasOwnProperty('color'))
            {
                this.$vuetify.theme.dark = (this.animation.theme === 'dark');
                this.$vuetify.theme.themes[this.animation.theme].primary = this.animation.color;
            }
        }
    };
</script>

<style scoped>

</style>
