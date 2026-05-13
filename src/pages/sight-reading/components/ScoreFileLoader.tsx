import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * .mxl is a zipped MusicXML file.
 * You can't read it as text like a plain .xml file because it's binary data.
 * file.arrayBuffer() reads the file's raw bytes into memory as an ArrayBuffer,
 * which is then wrapped in a Blob and handed to OSMD's load()
 * OSMD detects the ZIP header and handles decompression itself.
 */
export type ScoreContent = { xml: string } | { buffer: ArrayBuffer };

type ScoreFileLoaderProps = {
	fileName?: string;
	onLoad: (content: ScoreContent, fileName: string) => void;
};

const ScoreFileLoader = ({ fileName, onLoad }: ScoreFileLoaderProps) => {
	const [error, setError] = useState<Error | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
		try {
			setError(null);
			const file = e.target.files?.[0];
			if (!file) return;
			if (file.name.endsWith(".mxl")) {
				onLoad({ buffer: await file.arrayBuffer() }, file.name);
			} else {
				onLoad({ xml: await file.text() }, file.name);
			}
		} catch (error) {
			setError(error as Error);
		}
	};

	return (
		<div className="mb-6 flex flex-col items-center gap-3">
			{error && (
				<p
					className="text-sm text-destructive"
					aria-live="assertive"
					role="alert"
				>
					{error.message}
				</p>
			)}

			<Button
				variant="outline"
				className="cursor-pointer"
				size="sm"
				aria-haspopup="dialog"
				onClick={() => inputRef.current?.click()}
			>
				Load score from file
			</Button>
			<input
				ref={inputRef}
				type="file"
				accept=".xml,.musicxml,.mxl"
				className="hidden"
				onChange={handleFile}
			/>
			{fileName && (
				<span className="text-sm text-muted-foreground">{fileName}</span>
			)}
		</div>
	);
};

export default ScoreFileLoader;
