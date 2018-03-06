import Vue from "vue";
import router from "./router";
import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "open-iconic/font/css/open-iconic-bootstrap.css";
import datePicker from 'vue-bootstrap-datetimepicker';
import 'eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css';

import App from "./App.vue";

Vue.use(BootstrapVue);
Vue.config.productionTip = false;

const vm = new Vue({
  router,
  data: {
    user: null,
    searchWord: "",
  },
  render: h => h(App)
}).$mount("#app");


router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !vm.user) next("/login");
  else next();
});

