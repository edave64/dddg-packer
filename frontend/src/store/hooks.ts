import { useParams } from "@/router";
import { computed } from "vue";

const params = useParams();
export const usePackId = () => {
	return computed(() => {
		return params.value.packId as string;
	});
};
