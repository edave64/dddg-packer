import { createApp } from "vue";
import App from "./app.vue";
import PrimeVue from "primevue/config";
import "./style.css";
import "primevue/resources/themes/aura-dark-pink/theme.css";

import {
	provideFASTDesignSystem,
	fastCard,
	fastButton,
	fastBreadcrumb,
	fastBreadcrumbItem,
	fastTreeItem,
	fastTreeView,
	fastTextField,
	fastListbox,
	fastOption,
	fastSelect,
	fastDialog,
	fastNumberField,
	fastCheckbox,
} from "@microsoft/fast-components";

provideFASTDesignSystem().register(
	fastCard(),
	fastButton(),
	fastBreadcrumb(),
	fastBreadcrumbItem({
		separator: " > ",
	}),
	fastTreeItem(),
	fastTreeView(),
	fastTextField(),
	fastNumberField(),
	fastListbox(),
	fastSelect(),
	fastOption(),
	fastDialog(),
	fastCheckbox(),
);

createApp(App).use(PrimeVue).mount("#app");
