import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { IVisit } from '@/types';



export default function CustomerDonutChart({ visits }: { visits: IVisit[] }) {
    const COLORS = ['#22c55e', '#f97316'];
    const data = useMemo(() => {
        const customerCounts = visits.reduce((acc, visit) => {
            const cid = String(visit.customer_id);
            if (cid && cid !== 'undefined') acc[cid] = (acc[cid] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        let nuevos = 0, recurrentes = 0;
        Object.values(customerCounts).forEach(count => count === 1 ? nuevos++ : recurrentes++);

        return [{ name: 'Nuevos', value: nuevos }, { name: 'Recurrentes', value: recurrentes }];
    }, [visits]);

    return (
        <div className="w-full h-full min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}