import { createApp } from "vue";
import App from "./app.vue";
import PrimeVue from "primevue/config";
import "./style.css";
import "primevue/resources/themes/aura-dark-pink/theme.css";

import {
	provideFASTDesignSystem,
	fastBreadcrumb,
	fastBreadcrumbItem,
	fastTreeItem,
	fastTreeView,
} from "@microsoft/fast-components";

provideFASTDesignSystem().register(
	fastBreadcrumb(),
	fastBreadcrumbItem({
		separator: " > ",
	}),
	fastTreeItem(),
	fastTreeView(),
);

createApp(App).use(PrimeVue).mount("#app");
