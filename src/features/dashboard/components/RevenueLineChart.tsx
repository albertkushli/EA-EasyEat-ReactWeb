import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { IVisit } from '@/types';

export default function RevenueLineChart({ visits }: { visits: IVisit[] }) {
    const data = useMemo(() => {
        const grouped = visits.reduce((acc, visit) => {
            if (!visit.date) return acc;
            const dateStr = new Date(visit.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
            acc[dateStr] = (acc[dateStr] || 0) + (Number(visit.billAmount) || 0);
            return acc;
        }, {} as Record<string, number>);

        return Object.keys(grouped).slice(-15).map(date => ({ date, revenue: grouped[date] }));
    }, [visits]);

    return (
        <div className="w-full h-full min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(val) => `€${val}`} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="revenue" name="Ingresos" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316' }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}