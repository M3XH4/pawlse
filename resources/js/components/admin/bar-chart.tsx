import { cn } from '@/lib/utils';

export function AdminBarChart({
    values,
    colorClassName,
}: {
    values: number[];
    colorClassName: string;
}) {
    return (
        <div className="flex h-48 items-end justify-between gap-2 px-2">
            {values.map((height, index) => (
                <div
                    key={`${colorClassName}-${index}`}
                    className={cn('w-full rounded-t-lg', colorClassName)}
                    style={{ height: `${height}%` }}
                />
            ))}
        </div>
    );
}
