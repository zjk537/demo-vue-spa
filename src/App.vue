<template>
    <div class="main">
        <!-- <transition name="fade" mode="out-in">
        </transition> -->
        <router-view></router-view>
    </div>
</template>
<script>
export default {
    name: 'mainApp',
    data() {
        return {
            msg:{}
        }
    },
    methods: {
        
    }
}
</script>
<style>
html{
    width: 100%;
    height: 100%;
    background: #f0f3f5;
}
body{
    max-width: 540px;
    height: 100%;
    margin: 0 auto;
    background: #f0f3f5;
    position: relative;
}
.main {
    max-width: 540px;
    margin: 0 auto;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
</style>
