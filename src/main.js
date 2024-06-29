/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'
import vuetify from './plugins/vuetify'
import routes from './router/routes'
import { createPinia } from 'pinia'
import './main.scss'
import './main.css'

const app = createApp(App)
const pinia = createPinia()

registerPlugins(app)

app
  .use(vuetify)
  .use(pinia)
  .use(routes)
  .mount('#app')
