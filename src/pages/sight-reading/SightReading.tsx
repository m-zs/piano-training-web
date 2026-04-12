import ScoreViewer from "./components/ScoreViewer";

export const SightReading = () => {
	return (
		<main className="page-wrap px-4 py-12">
			<section className="island-shell rounded-2xl p-6 sm:p-8">
				<p className="island-kicker mb-2">Sight Reading</p>
				<ScoreViewer fileUrl={"/scores/fur-elise.mxl"} />
			</section>
		</main>
	);
};
