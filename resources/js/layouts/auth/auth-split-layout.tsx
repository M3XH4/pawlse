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
        <div className="relative flex min-h-dvh flex-col bg-paw-bg lg:grid lg:grid-cols-2 lg:bg-white">
            {/* Mobile Brand Header Banner */}
            <div className="relative overflow-hidden bg-paw-navy px-5 pt-6 pb-14 text-white rounded-b-[2rem] lg:hidden">
                <div className="pointer-events-none absolute -top-6 -right-6 opacity-10 rotate-12">
                    <PawPrint size={180} fill="currentColor" />
                </div>
                <div className="relative z-10 mx-auto max-w-[490px]">
                    <div className="flex items-center justify-between gap-3 mb-5">
                        <Link href={home()} className="flex items-center gap-2.5 group">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-paw-orange/25 bg-paw-orange flex items-center justify-center shrink-0">
                                <PawPrint size={20} className="text-white" fill="white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black tracking-tighter text-white leading-none uppercase">ILIGAN</h1>
                                <p className="text-[9px] font-black text-paw-orange uppercase tracking-widest leading-none mt-0.5">STRAY FEEDERS</p>
                            </div>
                        </Link>

                        <Link
                            href={home()}
                            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/90 transition-colors"
                        >
                            <ArrowLeft size={14} />
                            <span>Home</span>
                        </Link>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black leading-tight italic uppercase tracking-tight">
                        {title}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-white/70 font-medium leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>

            {/* Desktop Left Split Panel */}
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

            {/* Form Container */}
            <div className="relative z-10 w-full flex-1 px-4 pb-8 -mt-8 sm:px-6 lg:mt-0 lg:flex lg:items-center lg:justify-center lg:p-8">
                <div className="mx-auto flex w-full max-w-[490px] flex-col justify-center space-y-5 sm:space-y-6 rounded-[1.75rem] bg-white p-5 sm:p-7 shadow-xl shadow-paw-navy/10 border border-gray-100 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none lg:border-0">
                    <Link
                        href={home()}
                        className="hidden lg:inline-flex items-center gap-2 mb-4 text-gray-500 hover:text-paw-orange transition-colors group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
                    </Link>
                    <div className="md:mb-2">
                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-paw-navy uppercase italic tracking-tighter mb-1 lg:mb-4">{subTitle}</h3>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
