interface Stat {
  label: string;
  value: string | number;
  icon: string;
}

interface DashboardStatsProps {
  stats: Stat[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="text-2xl mb-2">{stat.icon}</div>
          <div className="text-2xl font-black text-brand-dark">{stat.value}</div>
          <div className="text-xs text-gray-500 font-medium mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
