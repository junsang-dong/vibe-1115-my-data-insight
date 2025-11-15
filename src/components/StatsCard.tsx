interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className="text-3xl">{icon}</div>
        )}
      </div>
    </div>
  );
}

