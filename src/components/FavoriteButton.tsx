import React from 'react';

interface FavoriteButtonProps {
    uuid: string;
    isFavorite: boolean;
    onToggleFavorite: (uuid: string) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
                                                           uuid,
                                                           isFavorite,
                                                           onToggleFavorite
                                                       }) => {
    const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.stopPropagation();
        onToggleFavorite(uuid);
    };

    return (
        <span
            onClick={handleClick}
            className={`symbol star ${isFavorite ? 'selected' : ''}`}
        >
            ★
        </span>
    );
}

export default FavoriteButton;