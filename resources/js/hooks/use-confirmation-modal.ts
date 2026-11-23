import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import type { ConfirmationModalProps } from '@/components/ui/confirmation-modal';

export interface OpenConfirmationModalOptions {
    title?: string;
    description?: ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmationModalProps['variant'];
    icon?: ConfirmationModalProps['icon'];
    hideCancel?: boolean;
    onConfirm?: () => void;
}

interface ConfirmationModalState extends OpenConfirmationModalOptions {
    isOpen: boolean;
    isLoading: boolean;
}

const DEFAULT_STATE: ConfirmationModalState = {
    isOpen: false,
    isLoading: false,
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed with this action?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
    hideCancel: false,
};

/**
 * Manages state for ConfirmationModal so pages can replace native alert()/confirm()
 * calls without duplicating modal boilerplate.
 */
export function useConfirmationModal() {
    const [state, setState] = useState<ConfirmationModalState>(DEFAULT_STATE);

    const closeConfirmModal = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
    }, []);

    const openConfirmModal = useCallback((options: OpenConfirmationModalOptions) => {
        setState({
            ...DEFAULT_STATE,
            ...options,
            isOpen: true,
            isLoading: false,
        });
    }, []);

    const setConfirmLoading = useCallback((isLoading: boolean) => {
        setState((prev) => ({ ...prev, isLoading }));
    }, []);

    const handleConfirm = useCallback(() => {
        const onConfirm = state.onConfirm;
        closeConfirmModal();
        onConfirm?.();
    }, [state.onConfirm, closeConfirmModal]);

    const confirmModalProps: ConfirmationModalProps = {
        isOpen: state.isOpen,
        onClose: closeConfirmModal,
        onConfirm: handleConfirm,
        title: state.title,
        description: state.description,
        confirmText: state.confirmText,
        cancelText: state.cancelText,
        variant: state.variant,
        icon: state.icon,
        hideCancel: state.hideCancel,
        isLoading: state.isLoading,
    };

    return {
        confirmModalProps,
        openConfirmModal,
        closeConfirmModal,
        setConfirmLoading,
    };
}
