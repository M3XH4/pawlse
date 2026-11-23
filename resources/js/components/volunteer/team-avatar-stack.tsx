import { formatPhotoUrl } from '@/lib/utils';

export interface AvatarStackMember {
    id?: number;
    task_id?: number;
    name: string;
    role: string;
    avatar_path?: string | null;
}

interface TeamAvatarStackProps {
    members: AvatarStackMember[];
    maxVisible?: number;
    onClick?: () => void;
    emptyText?: string;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'V';
}

export function TeamAvatarStack({
    members,
    maxVisible = 3,
    onClick,
    emptyText = 'No members yet',
}: TeamAvatarStackProps) {
    if (members.length === 0) {
        return (
            <span className="text-xs font-semibold text-gray-400">
                {emptyText}
            </span>
        );
    }

    const visible = members.slice(0, maxVisible);
    const remaining = members.length - visible.length;

    const content = (
        <div className="inline-flex items-center -space-x-2.5">
            {visible.map((member, index) => {
                const key = member.task_id ?? member.id ?? `${member.name}-${index}`;
                const avatarSrc = member.avatar_path ? formatPhotoUrl(member.avatar_path) : null;

                return (
                    <div
                        key={key}
                        title={`${member.name} • ${member.role}`}
                        className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-200 text-xs font-black text-[#0B2340] shadow-xs dark:border-slate-900 dark:bg-slate-700 dark:text-white"
                    >
                        {avatarSrc ? (
                            <img
                                src={avatarSrc}
                                alt={member.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span>{getInitials(member.name)}</span>
                        )}
                    </div>
                );
            })}

            {remaining > 0 && (
                <div
                    title={`+${remaining} more member(s)`}
                    className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-paw-orange text-xs font-black text-white shadow-xs dark:border-slate-900"
                >
                    +{remaining}
                </div>
            )}
        </div>
    );

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full transition hover:opacity-90"
                title="Click to view team roster"
            >
                {content}
            </button>
        );
    }

    return content;
}
