import { Link } from "@tanstack/react-router";

export const NavItem = ({ label, to }: { label: string; to: string }) => {
	return (
		<Link to={to} className="nav-link">
			{label}
		</Link>
	);
};
