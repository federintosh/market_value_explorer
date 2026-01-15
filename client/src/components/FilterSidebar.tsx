import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { teamColors, positionCategories, positionDetails, getSector } from "@/lib/constants";

interface FilterSidebarProps {
  teams: string[];
  positions: string[];
  selectedTeam: string | null;
  selectedPosition: string | null;
  selectedSector: string | null;
  onTeamChange: (team: string | null) => void;
  onPositionChange: (position: string | null) => void;
  onSectorChange: (sector: string | null) => void;
}

export default function FilterSidebar({
  teams,
  positions,
  selectedTeam,
  selectedPosition,
  selectedSector,
  onTeamChange,
  onPositionChange,
  onSectorChange,
}: FilterSidebarProps) {
  const [expandedTeams, setExpandedTeams] = useState(true);
  const [expandedPositions, setExpandedPositions] = useState(true);
  const [expandedSectors, setExpandedSectors] = useState(true);

  // Group positions by sector
  const positionsBySector = {
    DEF: positions.filter((p) => getSector(p) === "DEF"),
    MEI: positions.filter((p) => getSector(p) === "MEI"),
    ATA: positions.filter((p) => getSector(p) === "ATA"),
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-300 p-6 space-y-4 h-screen overflow-y-auto shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Filtros</h2>
        <p className="text-xs text-gray-600 mt-1">Explore por time e posição</p>
      </div>

      {/* Team Filter */}
      <div className="space-y-3">
        <button
          onClick={() => setExpandedTeams(!expandedTeams)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-300 hover:border-blue-400 hover:shadow-sm transition-all font-semibold text-gray-900"
        >
          <span>TIMES</span>
          {expandedTeams ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {expandedTeams && (
          <div className="space-y-2 pl-2">
            <Button
              variant={selectedTeam === null ? "default" : "outline"}
              className="w-full justify-start text-sm"
              onClick={() => onTeamChange(null)}
            >
              Todos os Times
            </Button>
            {teams.map((team) => {
              const colors = teamColors[team];
              const isSelected = selectedTeam === team;
              return (
                <Button
                  key={team}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-start text-left truncate text-sm ${
                    isSelected
                      ? ""
                      : `${colors.bg} ${colors.text} hover:${colors.bg} border ${colors.border}`
                  }`}
                  onClick={() => onTeamChange(team)}
                >
                  <span className="truncate">{team}</span>
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sector Filter */}
      <div className="space-y-3">
        <button
          onClick={() => setExpandedSectors(!expandedSectors)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-300 hover:border-blue-400 hover:shadow-sm transition-all font-semibold text-gray-900"
        >
          <span>SETORES</span>
          {expandedSectors ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {expandedSectors && (
          <div className="space-y-2 pl-2">
            <Button
              variant={selectedSector === null ? "default" : "outline"}
              className="w-full justify-start text-sm"
              onClick={() => onSectorChange(null)}
            >
              Todos os Setores
            </Button>
            {Object.entries(positionCategories).map(([sector, info]) => {
              const isSelected = selectedSector === sector;
              return (
                <Button
                  key={sector}
                  variant={isSelected ? "default" : "outline"}
                  className={`w-full justify-start text-sm ${
                    isSelected ? "" : `${info.color} hover:opacity-80 border`
                  }`}
                  onClick={() => onSectorChange(sector)}
                >
                  {info.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Position Filter by Sector */}
      <div className="space-y-3">
        <button
          onClick={() => setExpandedPositions(!expandedPositions)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-300 hover:border-blue-400 hover:shadow-sm transition-all font-semibold text-gray-900"
        >
          <span>POSIÇÕES</span>
          {expandedPositions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {expandedPositions && (
          <div className="space-y-3 pl-2">
            <Button
              variant={selectedPosition === null ? "default" : "outline"}
              className="w-full justify-start text-sm"
              onClick={() => onPositionChange(null)}
            >
              Todas as Posições
            </Button>

            {/* Sectors */}
            {Object.entries(positionsBySector).map(([sector, sectorPositions]) => {
              if (sectorPositions.length === 0) return null;
              const categoryInfo = positionCategories[sector as keyof typeof positionCategories];

              return (
                <div key={sector} className="space-y-2">
                  <div className={`${categoryInfo.color} px-3 py-2 rounded-lg text-xs font-bold`}>
                    {categoryInfo.label}
                  </div>
                  <div className="space-y-1 pl-2">
                    {sectorPositions.map((pos) => {
                      const isSelected = selectedPosition === pos;
                      const posLabel = positionDetails[pos]?.label || pos;
                      return (
                        <Button
                          key={pos}
                          variant={isSelected ? "default" : "outline"}
                          className={`w-full justify-start text-xs h-9 ${
                            isSelected ? "" : "bg-white hover:bg-gray-50"
                          }`}
                          onClick={() => onPositionChange(pos)}
                        >
                          <span className="font-semibold">{pos}</span>
                          <span className="ml-2 text-gray-500 text-xs">{posLabel}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Filters */}
      {(selectedTeam || selectedPosition || selectedSector) && (
        <div className="pt-4 border-t-2 border-gray-300 mt-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Ativos</h3>
          <div className="space-y-2">
            {selectedTeam && (
              <div className="flex items-center justify-between bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-semibold border border-blue-300">
                <span className="truncate">{selectedTeam}</span>
                <button
                  onClick={() => onTeamChange(null)}
                  className="hover:text-blue-900 ml-2 flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {selectedSector && (
              <div className="flex items-center justify-between bg-purple-100 text-purple-800 px-3 py-2 rounded-lg text-sm font-semibold border border-purple-300">
                <span>{positionCategories[selectedSector as keyof typeof positionCategories]?.label}</span>
                <button
                  onClick={() => onSectorChange(null)}
                  className="hover:text-purple-900 ml-2"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {selectedPosition && (
              <div className="flex items-center justify-between bg-amber-100 text-amber-800 px-3 py-2 rounded-lg text-sm font-semibold border border-amber-300">
                <span>{selectedPosition}</span>
                <button
                  onClick={() => onPositionChange(null)}
                  className="hover:text-amber-900 ml-2"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
