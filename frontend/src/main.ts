import { createApp } from "vue";
import App from "./app.vue";
import "./style.css";

import {
	provideFASTDesignSystem,
	fastCard,
	fastButton,
	fastBreadcrumb,
	fastBreadcrumbItem,
} from "@microsoft/fast-components";

provideFASTDesignSystem().register(
	fastCard(),
	fastButton(),
	fastBreadcrumb(),
	fastBreadcrumbItem(),
);

createApp(App).mount("#app");
