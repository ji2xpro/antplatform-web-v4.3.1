<template>
  <!-- <div id="app" :name="title"> -->
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import getPageTitle from '@/utils/get-page-title'
export default {
  name: 'App',
  // created() {
  //   this.$watch('$route.meta.title', () => {
  //     document.title = getPageTitle(this.$route.meta.title) + '-' + this.$t('platform.title')
  //   })
  // }
  // watch: {
  //   '$route.meta.title': function() {
  //     document.title = getPageTitle(this.$route.meta.title) + '-' + this.$t('platform.title')
  //   }
  // }
  // computed: {
    // title() {
      
      // if (this.$route.meta.title) {
      //   document.title = getPageTitle(this.$route.meta.title) + '-' + getPageTitle('title')
      // } else {
      //   document.title = getPageTitle('title')
      // }
      // return getPageTitle(this.$route.meta.title)

      // const { title } = this.$route.meta
      // const newTitle = title ? `${getPageTitle(title)}-${getPageTitle('title')}` : getPageTitle('title')
      // document.title = newTitle
      // return newTitle
    // }
  // },
  // mounted() {
  //   console.log(this.$route.meta.title)
  // }
}
</script>
