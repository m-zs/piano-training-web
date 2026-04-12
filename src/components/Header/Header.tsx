import { NavItem } from "./NavItem";
import ThemeToggle from "./ThemeToggle";

const navItems = [
	{
		label: "Home",
		to: "/",
	},
	{
		label: "Ear Training",
		to: "/ear-training",
	},
	{
		label: "Scales",
		to: "/scales",
	},
	{
		label: "Chords",
		to: "/chords",
	},
	{
		label: "Sight Reading",
		to: "/sight-reading",
	},
	{
		label: "Rythm",
		to: "/rythm",
	},
	{
		label: "About",
		to: "/about",
	},
];

export const Header = () => {
	return (
		<header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
			<nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
				<h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
					Piano
				</h2>

				<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold sm:flex-nowrap ml-auto">
					{navItems.map((item) => (
						<NavItem key={item.label} {...item} />
					))}
				</div>

				<div className="ml-auto">
					<ThemeToggle />
				</div>
			</nav>
		</header>
	);
};
