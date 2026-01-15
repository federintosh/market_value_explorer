import { Card } from "@/components/ui/card";
import { getPositionCategoryColor, positionDetails } from "@/lib/constants";
import { Star, Trophy } from "lucide-react";

interface Player {
  team: string;
  pos: string;
  name: string;
  rating: number;
  base_value: number;
  multiplier: number;
  market_value: number;
}

interface PlayerCardProps {
  player: Player;
  isTopPlayer?: boolean;
  positionRank?: number;
  totalInPosition?: number;
  allPlayers?: Player[];
}

export default function PlayerCard({
  player,
  isTopPlayer = false,
  positionRank,
  totalInPosition,
  allPlayers = [],
}: PlayerCardProps) {
  const categoryColor = getPositionCategoryColor(player.pos);
  const posLabel = positionDetails[player.pos]?.label || player.pos;

  // Calculate position rank if not provided
  let rank = positionRank;
  if (!rank && allPlayers.length > 0) {
    const playersInPosition = allPlayers.filter((p) => p.pos === player.pos);
    const sortedByValue = playersInPosition.sort((a, b) => b.market_value - a.market_value);
    rank = sortedByValue.findIndex((p) => p.name === player.name) + 1;
    totalInPosition = playersInPosition.length;
  }

  return (
    <Card className="p-5 bg-white border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group">
      <div className="space-y-4">
        {/* Header with position badge and ranking */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Position Badge */}
            <div className={`inline-block ${categoryColor.color} px-2.5 py-1 rounded-full text-xs font-bold mb-2`}>
              {player.pos}
            </div>
            {/* Player Name - Large and Prominent */}
            <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
              {player.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">{player.team}</p>
          </div>
          {/* Top Player Star or Ranking */}
          <div className="flex flex-col items-end gap-1">
            {isTopPlayer && (
              <Star className="text-amber-400 fill-amber-400 flex-shrink-0" size={24} />
            )}
            {rank && totalInPosition && (
              <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
                <Trophy size={14} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-600">
                  {rank}º de {totalInPosition}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Market Value - Main Highlight */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 uppercase tracking-widest font-semibold">Valor de Mercado</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">
            ${player.market_value.toFixed(2)}
          </p>
        </div>

        {/* Rating - Simple and Clean */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Overall</span>
          <span className="text-2xl font-bold text-gray-900">{player.rating}</span>
        </div>
      </div>
    </Card>
  );
}
