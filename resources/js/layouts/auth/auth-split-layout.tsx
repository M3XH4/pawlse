import { Link } from '@inertiajs/react';
import { ArrowLeft, PawPrint } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';


export default function AuthSplitLayout({
    children,
    title,
    description,
    subTitle,
}: AuthLayoutProps) {
    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-paw-navy p-10 text-white lg:flex dark:border-r">
                <div className="absolute top-0 left-0 p-20 opacity-10 -z-0 rotate-12 scale-150">
                    <PawPrint size={300} fill="currentColor" />
                </div>
                <div className="relative z-10 flex items-start flex-col justify-center h-full">
                    <Link href={home()} className="flex items-center gap-4 mb-16 group">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-xl shadow-paw-orange/20 group-hover:scale-110 transition-transform bg-paw-orange flex items-center justify-center">
                            <PawPrint size={24} className="text-white" fill="white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter text-white leading-none uppercase">ILIGAN</h1>
                            <p className="text-[10px] font-black text-paw-orange uppercase tracking-widest leading-none">STRAY FEEDERS</p>
                        </div>
                    </Link>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-black mb-6 md:mb-8 leading-tight italic uppercase tracking-tighter">
                        {title}
                    </h2>
                    <p className="text-base md:text-lg lg:text-xl text-white/60 font-bold mb-8 md:mb-12 max-w-lg leading-relaxed italic">
                        {description}
                    </p>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[490px]">
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-2 mb-4 text-gray-500 hover:text-paw-orange transition-colors group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
                    </Link>
                    <div className="md:mb-2">
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground-secondary uppercase italic tracking-tighter italic mb-3 md:mb-4">{subTitle}</h3>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
