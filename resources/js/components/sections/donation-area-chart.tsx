import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DonationAreaChartProps {
    activeTab: string;
    activeChartData: Array<{ name: string; amount: number; id?: string }>;
    gradientId: string;
}

export default function DonationAreaChart({ activeTab, activeChartData, gradientId }: DonationAreaChartProps) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart key={`area-chart-${activeTab}`} data={activeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs key="defs">
                    <linearGradient key="gradient" id={`donation-gradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid key="grid" strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis key="xaxis" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                <YAxis key="yaxis" hide />
                <Tooltip
                    key="tooltip"
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', fontWeight: 'black' }}
                />
                <Area key="area" type="monotone" dataKey="amount" stroke="#22C55E" strokeWidth={4} fillOpacity={1} fill={`url(#donation-gradient-${gradientId})`} />
            </AreaChart>
        </ResponsiveContainer>
    );
}
