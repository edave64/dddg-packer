import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],

	base: "./",

	resolve: {
		alias: {
			"@": "/src/",
		},
	},

	rollupOptions: {
		external: /^@microsoft\/fast-(element|components)/,
	},

	define: {
		__VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
	},
});
