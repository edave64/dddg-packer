import { createApp } from "vue";
import App from "./app.vue";
import "./style.css";

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
);

createApp(App).mount("#app");
