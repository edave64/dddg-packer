import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],

	base: "./",

	resolve: {
		alias: {
			"@": "/src/",
			"@wails": "/wailsjs/",
		},
	},

	define: {
		__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
	},
});
