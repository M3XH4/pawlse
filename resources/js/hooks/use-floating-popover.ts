import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseFloatingPopoverOptions {
    isOpen: boolean;
    onClose: () => void;
    estimatedHeight?: number;
    estimatedWidth?: number;
    preferredPlacement?: 'bottom' | 'top';
    offset?: number;
}

export interface FloatingCoords {
    top?: number;
    bottom?: number;
    left: number;
    width?: number;
    placement: 'bottom' | 'top';
}

export function useFloatingPopover({
    isOpen,
    onClose,
    estimatedHeight = 360,
    estimatedWidth = 320,
    preferredPlacement = 'bottom',
    offset = 8,
}: UseFloatingPopoverOptions) {
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<FloatingCoords | null>(null);

    const updatePosition = useCallback(() => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();

        // If trigger is detached or hidden (e.g. scrolled far offscreen)
        if (rect.width === 0 && rect.height === 0) return;

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Auto flip if there is not enough space below and more space above
        let placement: 'bottom' | 'top' = preferredPlacement;
        if (placement === 'bottom') {
            if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
                placement = 'top';
            }
        } else {
            if (spaceAbove < estimatedHeight && spaceBelow > spaceAbove) {
                placement = 'bottom';
            }
        }

        // Clamp left position within viewport
        const minMargin = 12;
        let left = rect.left;
        if (left + estimatedWidth > window.innerWidth - minMargin) {
            left = Math.max(
                minMargin,
                window.innerWidth - estimatedWidth - minMargin,
            );
        }
        if (left < minMargin) {
            left = minMargin;
        }

        if (placement === 'bottom') {
            setCoords({
                top: rect.bottom + offset,
                left,
                width: rect.width,
                placement: 'bottom',
            });
        } else {
            setCoords({
                bottom: window.innerHeight - rect.top + offset,
                left,
                width: rect.width,
                placement: 'top',
            });
        }
    }, [estimatedHeight, estimatedWidth, preferredPlacement, offset]);

    useEffect(() => {
        if (!isOpen) {
            setCoords(null);
            return;
        }

        updatePosition();

        const handleScroll = () => {
            updatePosition();
        };

        const handleResize = () => {
            updatePosition();
        };

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node;
            if (
                triggerRef.current &&
                !triggerRef.current.contains(target) &&
                popoverRef.current &&
                !popoverRef.current.contains(target)
            ) {
                onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, true);
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll, true);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, updatePosition, onClose]);

    return {
        triggerRef,
        popoverRef,
        coords,
        updatePosition,
    };
}
