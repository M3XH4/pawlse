import { toast } from 'sonner';

export interface EventDateBadgeInfo {
    month: string;
    day: string;
    year: string;
    weekday: string;
    fullDate: string;
    relativeBadge?: string;
    isPast: boolean;
}

/**
 * Safely parse a date string into a Date object.
 */
export function parseEventDate(dateString?: string | null): Date | null {
    if (!dateString) return null;

    // Handle "YYYY-MM-DD" or "YYYY-MM-DDT..." formats
    if (typeof dateString === 'string') {
        const cleanStr = dateString.trim();
        // If it's pure YYYY-MM-DD, construct with local components to avoid UTC shift
        const ymdMatch = cleanStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (ymdMatch) {
            const year = parseInt(ymdMatch[1], 10);
            const monthIndex = parseInt(ymdMatch[2], 10) - 1;
            const day = parseInt(ymdMatch[3], 10);
            const d = new Date(year, monthIndex, day);
            if (!isNaN(d.getTime())) return d;
        }

        const parsed = new Date(cleanStr);
        if (!isNaN(parsed.getTime())) return parsed;

        // Try standard text like "SEP 22" or "SEP 22, 2026"
        const textMatch = cleanStr.match(/^([A-Za-z]+)\s+(\d{1,2})(?:,?\s*(\d{4}))?/);
        if (textMatch) {
            const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const monthIdx = monthNames.findIndex(m => textMatch[1].toLowerCase().startsWith(m));
            if (monthIdx !== -1) {
                const day = parseInt(textMatch[2], 10);
                const year = textMatch[3] ? parseInt(textMatch[3], 10) : new Date().getFullYear();
                return new Date(year, monthIdx, day);
            }
        }
    }

    return null;
}

/**
 * Formats an event date string to a human-friendly string.
 * Example: "Wednesday, Sep 2, 2026" or "Sep 2, 2026"
 */
export function formatEventDate(dateString?: string | null, format: 'full' | 'short' | 'weekday' = 'full'): string {
    if (!dateString) return 'Date TBA';

    const date = parseEventDate(dateString);
    if (!date) return String(dateString);

    if (format === 'weekday') {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    if (format === 'short') {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Returns month, day, year, weekday and relative time status for cards and badges.
 */
export function getEventDateBadge(dateString?: string | null): EventDateBadgeInfo {
    const date = parseEventDate(dateString);

    if (!date) {
        return {
            month: 'DATE',
            day: 'TBA',
            year: '',
            weekday: '',
            fullDate: dateString || 'TBA',
            isPast: false
        };
    }

    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear());
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const fullDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = eventDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let relativeBadge: string | undefined;
    let isPast = false;

    if (diffDays < 0) {
        relativeBadge = 'Past Event';
        isPast = true;
    } else if (diffDays === 0) {
        relativeBadge = 'Today!';
    } else if (diffDays === 1) {
        relativeBadge = 'Tomorrow';
    } else if (diffDays <= 7) {
        relativeBadge = `In ${diffDays} days`;
    }

    return {
        month,
        day,
        year,
        weekday,
        fullDate,
        relativeBadge,
        isPast
    };
}

/**
 * Parses time string like "09:00 AM - 03:00 PM" into clean 12-hour format.
 */
export function formatEventTime(timeString?: string | null): string {
    if (!timeString || !timeString.trim()) return 'Time TBA';
    return timeString.trim();
}

/**
 * Generate Google Calendar add-event URL
 */
export function generateGoogleCalendarUrl(event: {
    title: string;
    date: string;
    time?: string;
    location?: string;
    desc?: string;
}): string {
    const date = parseEventDate(event.date);
    if (!date) return 'https://calendar.google.com';

    let startTimeStr = '090000';
    let endTimeStr = '120000';

    if (event.time) {
        // Try parsing range like "09:00 AM - 03:00 PM"
        const timeParts = event.time.split('-');
        if (timeParts.length >= 1) {
            const parseTime = (t: string) => {
                const match = t.trim().match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
                if (match) {
                    let hour = parseInt(match[1], 10);
                    const minute = match[2] ? match[2] : '00';
                    const ampm = match[3] ? match[3].toUpperCase() : '';
                    if (ampm === 'PM' && hour < 12) hour += 12;
                    if (ampm === 'AM' && hour === 12) hour = 0;
                    return String(hour).padStart(2, '0') + minute + '00';
                }
                return null;
            };

            const parsedStart = parseTime(timeParts[0]);
            if (parsedStart) startTimeStr = parsedStart;

            if (timeParts.length > 1) {
                const parsedEnd = parseTime(timeParts[1]);
                if (parsedEnd) endTimeStr = parsedEnd;
            } else {
                // Default 2 hours later
                const startHour = parseInt(startTimeStr.slice(0, 2), 10);
                endTimeStr = String(Math.min(startHour + 2, 23)).padStart(2, '0') + startTimeStr.slice(2);
            }
        }
    }

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    const startIso = `${y}${m}${d}T${startTimeStr}`;
    const endIso = `${y}${m}${d}T${endTimeStr}`;

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `Pawlse Event: ${event.title}`,
        dates: `${startIso}/${endIso}`,
        details: `${event.desc || ''}\n\nJoin us and support the strays of Iligan!\nMore info: ${window.location.origin}/events`,
        location: event.location || 'Iligan City'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export interface ShareOptions {
    platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram' | 'instagram' | 'copy' | 'calendar' | 'native';
    event: {
        id: number;
        title: string;
        date: string;
        time?: string;
        location: string;
        category?: string;
        desc?: string;
        img?: string;
    };
    customUrl?: string;
}

/**
 * Builds a structured, complete post string with Title, Category, Date, Time, Location, Description & Link.
 */
export function buildEventPostContent(event: ShareOptions['event'], url: string): {
    fullPost: string;
    shortSummary: string;
    headline: string;
} {
    const formattedDate = formatEventDate(event.date, 'weekday');
    const timeStr = event.time ? formatEventTime(event.time) : 'Time TBA';
    const categoryTag = event.category ? `#${event.category.replace(/\s+/g, '')}` : '#CommunityEvent';

    const lines = [
        `📢 ${event.title.toUpperCase()}`,
        `✨ Category: ${event.category || 'Community Initiative'}`,
        `🗓 Date: ${formattedDate}`,
        `⏰ Time: ${timeStr}`,
        `📍 Location: ${event.location}`,
    ];

    if (event.desc && event.desc.trim()) {
        lines.push('', `📝 About this Event:\n${event.desc.trim()}`);
    }

    lines.push(
        '',
        '🐾 Join us in supporting local animal rescue efforts in Iligan!',
        `🔗 Event link: ${url}`,
        '',
        `#Pawlse #AnimalRescue #IliganCity ${categoryTag} #AdoptDontShop`
    );

    const fullPost = lines.join('\n');
    const shortSummary = `🐾 ${event.title}\n🗓 ${formattedDate} | ⏰ ${timeStr}\n📍 ${event.location}\n\n${event.desc ? event.desc.slice(0, 120) + '... ' : ''}\n🔗 ${url}`;
    const headline = `🐾 ${event.title} - ${formattedDate}`;

    return { fullPost, shortSummary, headline };
}

/**
 * Handle social media sharing, link copying, and calendar integration.
 */
export async function shareEvent({ platform, event, customUrl }: ShareOptions): Promise<void> {
    const baseUrl = customUrl || (typeof window !== 'undefined' ? `${window.location.origin}/events?event=${event.id}` : '');
    const { fullPost, shortSummary } = buildEventPostContent(event, baseUrl);

    const encodedUrl = encodeURIComponent(baseUrl);
    const encodedFullPost = encodeURIComponent(fullPost);

    switch (platform) {
        case 'facebook': {
            const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedFullPost}`;
            window.open(fbUrl, '_blank', 'width=650,height=550,noopener,noreferrer');
            toast.success('Opening Facebook share...');
            break;
        }

        case 'twitter': {
            const tweetText = encodeURIComponent(`🐾 ${event.title}\n🗓 ${formatEventDate(event.date, 'short')} | ⏰ ${event.time || 'TBA'}\n📍 ${event.location}\n\nJoin us!`);
            const twUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodedUrl}&hashtags=Pawlse,AnimalRescue,IliganCity`;
            window.open(twUrl, '_blank', 'width=650,height=550,noopener,noreferrer');
            toast.success('Opening X (Twitter) share...');
            break;
        }

        case 'whatsapp': {
            const waUrl = `https://api.whatsapp.com/send?text=${encodedFullPost}`;
            window.open(waUrl, '_blank', 'width=650,height=550,noopener,noreferrer');
            toast.success('Opening WhatsApp...');
            break;
        }

        case 'telegram': {
            const tgUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedFullPost}`;
            window.open(tgUrl, '_blank', 'width=650,height=550,noopener,noreferrer');
            toast.success('Opening Telegram...');
            break;
        }

        case 'instagram': {
            try {
                await navigator.clipboard.writeText(fullPost);
                toast.success('Full event post copied to clipboard!', {
                    description: 'Ready to paste into your Instagram caption, story, or DM.'
                });
            } catch (e) {
                toast.error('Failed to copy event details.');
            }
            break;
        }

        case 'calendar': {
            const calUrl = generateGoogleCalendarUrl(event);
            window.open(calUrl, '_blank', 'noopener,noreferrer');
            toast.success('Opening Google Calendar...');
            break;
        }

        case 'native': {
            if (navigator.share) {
                try {
                    const shareData: ShareData = {
                        title: event.title,
                        text: fullPost,
                        url: baseUrl
                    };

                    if (event.img && navigator.canShare) {
                        try {
                            const res = await fetch(event.img, { mode: 'cors' });
                            if (res.ok) {
                                const blob = await res.blob();
                                const file = new File([blob], `event-${event.id}.jpg`, { type: blob.type || 'image/jpeg' });
                                if (navigator.canShare({ files: [file] })) {
                                    shareData.files = [file];
                                }
                            }
                        } catch {
                            // Fallback to text & url if image fetch fails
                        }
                    }

                    await navigator.share(shareData);
                    toast.success('Event shared successfully!');
                } catch (err) {
                    if ((err as Error).name !== 'AbortError') {
                        await navigator.clipboard.writeText(fullPost);
                        toast.success('Full event post copied to clipboard!');
                    }
                }
            } else {
                await navigator.clipboard.writeText(fullPost);
                toast.success('Full event post copied to clipboard!');
            }
            break;
        }

        case 'copy':
        default: {
            try {
                await navigator.clipboard.writeText(fullPost);
                toast.success('Full event post copied to clipboard!', {
                    description: 'Title, time, date, location, and description are copied and ready to paste.'
                });
            } catch (e) {
                toast.error('Failed to copy event post.');
            }
            break;
        }
    }
}
