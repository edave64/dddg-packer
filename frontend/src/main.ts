import { definePreset } from "@primeuix/themes";
import Material from "@primeuix/themes/material-compat";
import PrimeVue from "primevue/config";
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router.js";
import "./style.css";

const DddgPreset = definePreset(Material, {
	semantic: {
		primary: {
			50: "{pink.50}",
			100: "{pink.100}",
			200: "{pink.200}",
			300: "{pink.300}",
			400: "{pink.400}",
			500: "{pink.500}",
			600: "{pink.600}",
			700: "{pink.700}",
			800: "{pink.800}",
			900: "{pink.900}",
			950: "{pink.950}",
		},
	},
});

createApp(App)
	.use(PrimeVue, {
		theme: {
			preset: DddgPreset,
		},
	})
	.use(router)
	.mount("#app");
