import { useState } from "react";
import ScoreFileLoader, {
	type ScoreContent,
} from "./components/ScoreFileLoader";
import ScoreViewer from "./components/ScoreViewer";

export const SightReading = () => {
	const [score, setScore] = useState<ScoreContent | null>(null);
	const [fileName, setFileName] = useState<string | undefined>();

	const handleLoad = (content: ScoreContent, name: string) => {
		setScore(content);
		setFileName(name);
	};

	return (
		<main className="page-wrap px-4 py-12">
			<section className="island-shell rounded-2xl p-6 sm:p-8">
				<p className="island-kicker mb-2">Sight Reading</p>
				<ScoreFileLoader fileName={fileName} onLoad={handleLoad} />
				{score && "buffer" in score ? (
					<ScoreViewer buffer={score.buffer} />
				) : null}
				{score && "xml" in score ? <ScoreViewer xml={score.xml} /> : null}
			</section>
		</main>
	);
};
