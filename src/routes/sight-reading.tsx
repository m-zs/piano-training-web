import { createFileRoute } from "@tanstack/react-router";
import { SightReading } from "#/pages/sight-reading/SightReading";

export const Route = createFileRoute("/sight-reading")({
	component: SightReading,
});
