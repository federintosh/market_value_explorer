import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { positionCategories, getSector } from "@/lib/constants";

interface Player {
  team: string;
  pos: string;
  name: string;
  rating: number;
  base_value: number;
  multiplier: number;
  market_value: number;
}

interface TeamStatsProps {
  players: Player[];
}

export default function TeamStats({ players }: TeamStatsProps) {
  // Calculate team stats
  const teamStats = players.reduce(
    (acc, player) => {
      const team = player.team;
      const sector = getSector(player.pos);
      if (!acc[team]) {
        acc[team] = {
          team,
          total: 0,
          count: 0,
          avgRating: 0,
          DEF: 0,
          MEI: 0,
          ATA: 0,
          DEFValue: 0,
          MEIValue: 0,
          ATAValue: 0,
        };
      }
      acc[team].total += player.market_value;
      acc[team].count += 1;
      acc[team].avgRating += player.rating;
      acc[team][sector]++;
      acc[team][`${sector}Value`] += player.market_value;
      return acc;
    },
    {} as Record<
      string,
      {
        team: string;
        total: number;
        count: number;
        avgRating: number;
        DEF: number;
        MEI: number;
        ATA: number;
        DEFValue: number;
        MEIValue: number;
        ATAValue: number;
      }
    >
  );

  const chartData = Object.values(teamStats)
    .map((stat) => ({
      team: stat.team,
      total: Math.round(stat.total),
      avgRating: Math.round((stat.avgRating / stat.count) * 10) / 10,
      DEF: stat.DEF,
      MEI: stat.MEI,
      ATA: stat.ATA,
      DEFValue: Math.round(stat.DEFValue),
      MEIValue: Math.round(stat.MEIValue),
      ATAValue: Math.round(stat.ATAValue),
    }))
    .sort((a, b) => b.total - a.total);

  const totalMarketValue = chartData.reduce((sum, team) => sum + team.total, 0);
  const avgTeamValue = Math.round(totalMarketValue / chartData.length);
  const highestTeam = chartData[0];

  // Sector distribution data
  const sectorDistribution = [
    {
      name: "Defesa",
      value: chartData.reduce((sum, t) => sum + t.DEFValue, 0),
      players: chartData.reduce((sum, t) => sum + t.DEF, 0),
    },
    {
      name: "Meio",
      value: chartData.reduce((sum, t) => sum + t.MEIValue, 0),
      players: chartData.reduce((sum, t) => sum + t.MEI, 0),
    },
    {
      name: "Ataque",
      value: chartData.reduce((sum, t) => sum + t.ATAValue, 0),
      players: chartData.reduce((sum, t) => sum + t.ATA, 0),
    },
  ];

  const COLORS = ["#059669", "#f59e0b", "#ef4444"];

  // Sector value by team
  const sectorByTeamData = chartData.map((team) => ({
    team: team.team.substring(0, 8),
    Defesa: team.DEFValue,
    Meio: team.MEIValue,
    Ataque: team.ATAValue,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-0">
          <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Valor Total</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">
            ${totalMarketValue.toLocaleString()}
          </p>
          <p className="text-xs text-blue-700 mt-2">{chartData.length} times</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-0">
          <p className="text-sm text-green-600 font-semibold uppercase tracking-wide">Valor Médio</p>
          <p className="text-3xl font-bold text-green-900 mt-2">
            ${avgTeamValue.toLocaleString()}
          </p>
          <p className="text-xs text-green-700 mt-2">Por time</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-0">
          <p className="text-sm text-amber-600 font-semibold uppercase tracking-wide">Maior Elenco</p>
          <p className="text-3xl font-bold text-amber-900 mt-2">
            ${highestTeam.total.toLocaleString()}
          </p>
          <p className="text-xs text-amber-700 mt-2">{highestTeam.team}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-0">
          <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide">Rating Médio</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">
            {(chartData.reduce((sum, t) => sum + t.avgRating, 0) / chartData.length).toFixed(1)}
          </p>
          <p className="text-xs text-purple-700 mt-2">Geral</p>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valor Total por Time */}
        <Card className="p-6 border-0 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Valor Total por Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="team" type="category" stroke="#6b7280" width={100} />
              <Tooltip
                formatter={(value) => `$${value.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="total" fill="#1e40af" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribuição por Setor */}
        <Card className="p-6 border-0 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribuição por Setor</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectorDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, players }) => `${name}: $${value.toLocaleString()} (${players})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `$${value.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Valor por Setor por Time */}
        <Card className="p-6 border-0 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Valor de Mercado por Setor e Time</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={sectorByTeamData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="team" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                formatter={(value) => `$${value.toLocaleString()}`}
                contentStyle={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Bar dataKey="Defesa" stackId="a" fill="#059669" />
              <Bar dataKey="Meio" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Ataque" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Rating Médio por Time */}
        <Card className="p-6 border-0 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rating Médio por Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="team" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={[70, 85]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="avgRating"
                stroke="#1e40af"
                strokeWidth={2}
                dot={{ fill: "#1e40af", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Sector Summary Table */}
      <Card className="p-6 border-0 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo por Setor</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-4 font-semibold text-gray-900">Setor</th>
                <th className="text-right py-2 px-4 font-semibold text-gray-900">Valor Total</th>
                <th className="text-right py-2 px-4 font-semibold text-gray-900">Jogadores</th>
                <th className="text-right py-2 px-4 font-semibold text-gray-900">Valor Médio</th>
                <th className="text-right py-2 px-4 font-semibold text-gray-900">% do Total</th>
              </tr>
            </thead>
            <tbody>
              {sectorDistribution.map((sector, idx) => (
                <tr key={sector.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${COLORS[idx] === "#059669" ? "bg-green-100 text-green-800" : COLORS[idx] === "#f59e0b" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                      {sector.name}
                    </span>
                  </td>
                  <td className="text-right py-3 px-4 font-semibold text-gray-900">${sector.value.toLocaleString()}</td>
                  <td className="text-right py-3 px-4 text-gray-600">{sector.players}</td>
                  <td className="text-right py-3 px-4 text-gray-600">${(sector.value / sector.players).toFixed(2)}</td>
                  <td className="text-right py-3 px-4 font-semibold text-gray-900">
                    {((sector.value / totalMarketValue) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
