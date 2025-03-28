import { Buffer } from 'buffer'
import { createApp } from 'vue'

// @ts-ignore
import App from './App.vue'
import './assets/main.css'

window.Buffer = Buffer

createApp(App).mount('#app')
