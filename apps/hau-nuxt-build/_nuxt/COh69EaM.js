import{_ as i,d as c}from"./DOWtmalN.js";import{y as p,A as r,B as o,C as s}from"./DEsnR_DS.js";const _={props:{module_data:{type:Object,required:!0}},setup(a){const{$parse_module_data:n}=c(),l=n(a.module_data);return p(()=>{const e=`
                        <button type="button" class="plyr__control plyr_btn play_btn hover_cta" aria-label="Play, {title}" data-plyr="play">
                            <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-pause"></use></svg>
                            <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-play"></use></svg>
                        </button>
                <div class="plyr__controls">
                    <div class="controls_left">
                        <button type="button" class="plyr__control plyr_btn hover_cta" aria-label="Mute" data-plyr="mute">
                            <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-muted"></use></svg>
                            <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-volume"></use></svg>
                        </button>
                        <button type="button" class="plyr__control plyr_btn plyr_fs_btn hover_cta" aria-label="Fullscreen" data-plyr="fullscreen">
                            <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-exit-fullscreen"></use></svg>
                            <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-enter-fullscreen"></use></svg>
                        </button>
                    </div>
                    <div class="controls_center" style="display: none;">
                        <div class="plyr__time plyr__time--current sub_m" aria-label="Current time">00:00</div>
                        <div class="plyr__progress">
                            <input data-plyr="seek" type="range" min="0" max="100" step="0.01" value="0" aria-label="Seek">
                            <progress class="plyr__progress__buffer" min="0" max="100" value="0">% buffered</progress>
                        </div>
                        <div class="plyr__time plyr__time--duration sub_m" aria-label="Duration">00:00</div>
                    </div>
                </div>`;if(l._value.video!=!1){const t=new Plyr(".video_player",{controls:e,settings:["loop"]});t.on("enterfullscreen",()=>{document.body.classList.add("fullscreen-active")}),t.on("exitfullscreen",()=>{document.body.classList.remove("fullscreen-active")})}}),{m_data:l}},mounted(){}},d={class:"video_play"},u={class:"wrapper h100"},y={class:"row h100"},v={key:0,class:"vimeo_player_container"},m=["src"],f=["data-poster"],b=["src"];function h(a,n,l,e,t,g){return r(),o("section",d,[s("div",u,[s("div",y,[e.m_data.vimeo_url!=""?(r(),o("div",v,[s("iframe",{src:e.m_data.vimeo_url,frameborder:"0",allow:"autoplay; fullscreen",allowfullscreen:""},null,8,m)])):(r(),o("video",{key:1,class:"video_player",loop:"",playsinline:"","data-poster":e.m_data.thumbnail.url},[s("source",{src:e.m_data.video.url,type:"video/mp4"},null,8,b)],8,f))])])])}const w=i(_,[["render",h]]);export{w as default};
