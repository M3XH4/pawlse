import { AlertCircleIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AlertError({
    errors,
    title,
}: {
    errors: string[];
    title?: string;
}) {
    const uniqueErrors = Array.from(new Set(errors.filter(Boolean)));

    if (uniqueErrors.length === 0) {
        return null;
    }

    return (
        <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>
                {title || 'Your request could not be completed. Please review the details below:'}
            </AlertTitle>
            <AlertDescription>
                <p className="mb-1.5 text-xs opacity-90">
                    Fix the highlighted item{uniqueErrors.length > 1 ? 's' : ''} below and submit again:
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                    {uniqueErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
}
