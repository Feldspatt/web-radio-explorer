// VoteButton.tsx - Separated component for votes
import React from "react";
import { paths } from "../services/path.service.ts";

interface VoteButtonProps {
	uuid: string;
	votes: number;
}

const VoteButton: React.FC<VoteButtonProps> = ({ uuid, votes }) => {
	const handleVote = async (event: React.MouseEvent<HTMLSpanElement>) => {
		event.stopPropagation();
		try {
			const response = await fetch(paths.getVote(uuid));
			if (!response.ok) {
				throw new Error(`Error sending vote`);
			}
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<span>
			<span onClick={handleVote} className="symbol">
				👍
			</span>{" "}
			{votes}
		</span>
	);
};

export default VoteButton;
