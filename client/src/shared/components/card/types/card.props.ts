import React from 'react';

export interface CardProps {
    title?: string,
    styleClassName?: string,
    icon?: string,
    iconNum?: number,
    onIconClick?: () => void,
    onClick?: (event: React.MouseEvent) => void,
    children: any
}
