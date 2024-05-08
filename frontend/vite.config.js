import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: (tag) =>
						[
							"fast-breadcrumb",
							"fast-breadcrumb-item",
							"fast-tree-view",
							"fast-tree-item",
							"fast-text-field",
						].includes(tag),
				},
			},
		}),
	],

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
