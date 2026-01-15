import { useState, useEffect, useMemo } from "react";
import FilterSidebar from "@/components/FilterSidebar";
import PlayerCard from "@/components/PlayerCard";
import TeamStats from "@/components/TeamStats";
import TeamBuilderModal from "@/components/TeamBuilderModal";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, TrendingUp, Menu, X } from "lucide-react";
import { getSector } from "@/lib/constants";

interface Player {
  team: string;
  pos: string;
  name: string;
  rating: number;
  base_value: number;
  multiplier: number;
  market_value: number;
}

type SortOption = "valor" | "overall" | "setor";

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "stats">("cards");
  const [sortOption, setSortOption] = useState<SortOption>("valor");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [teamBuilderOpen, setTeamBuilderOpen] = useState(false);

  // Load players data
  useEffect(() => {
    fetch("/players_data.json")
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading players data:", err);
        setLoading(false);
      });
  }, []);

  // Get unique teams and positions
  const teams = useMemo(() => {
    return Array.from(new Set(players.map((p) => p.team))).sort();
  }, [players]);

  const positions = useMemo(() => {
    return Array.from(new Set(players.map((p) => p.pos))).sort();
  }, [players]);

  // Filter players
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchTeam = !selectedTeam || player.team === selectedTeam;
      const matchPosition = !selectedPosition || player.pos === selectedPosition;
      const matchSector = !selectedSector || getSector(player.pos) === selectedSector;
      const matchSearch =
        !searchQuery ||
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.team.toLowerCase().includes(searchQuery.toLowerCase());

      return matchTeam && matchPosition && matchSector && matchSearch;
    });
  }, [players, selectedTeam, selectedPosition, selectedSector, searchQuery]);

  // Sort players based on selected option
  const sortedPlayers = useMemo(() => {
    const sorted = [...filteredPlayers];

    if (sortOption === "valor") {
      sorted.sort((a, b) => b.market_value - a.market_value);
    } else if (sortOption === "overall") {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === "setor") {
      const sectorOrder = { DEF: 0, MEI: 1, ATA: 2 };
      sorted.sort((a, b) => {
        const sectorA = sectorOrder[getSector(a.pos)];
        const sectorB = sectorOrder[getSector(b.pos)];
        if (sectorA !== sectorB) return sectorA - sectorB;
        return b.market_value - a.market_value;
      });
    }

    return sorted;
  }, [filteredPlayers, sortOption]);

  // Identify top players (top 3 by market value)
  const topPlayerNames = useMemo(() => {
    return new Set(
      [...players]
        .sort((a, b) => b.market_value - a.market_value)
        .slice(0, 3)
        .map((p) => p.name)
    );
  }, [players]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      {sidebarOpen && (
        <FilterSidebar
          teams={teams}
          positions={positions}
          selectedTeam={selectedTeam}
          selectedPosition={selectedPosition}
          selectedSector={selectedSector}
          onTeamChange={setSelectedTeam}
          onPositionChange={setSelectedPosition}
          onSectorChange={setSelectedSector}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={sidebarOpen ? "Ocultar sidebar" : "Mostrar sidebar"}
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                      <TrendingUp className="text-white" size={28} />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900">Explorador de Valor</h1>
                      <p className="text-sm text-gray-600 mt-1">Feito por Luis</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Montar Elenco Button */}
              <button
                onClick={() => setTeamBuilderOpen(true)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                ⚽ Montar Elenco
              </button>
            </div>

            {/* Search and Controls */}
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex-1 min-w-80 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <Input
                  placeholder="Buscar jogador ou time..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-300"
                />
              </div>

              {/* Sort Options (only show when team is selected) */}
              {selectedTeam && viewMode === "cards" && (
                <div className="flex gap-2">
                  <span className="text-sm font-semibold text-gray-700 self-center">Ordenar:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="valor">Por Valor</option>
                    <option value="overall">Por Overall</option>
                    <option value="setor">Por Setor</option>
                  </select>
                </div>
              )}

              {/* View Toggle */}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    viewMode === "cards"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode("stats")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    viewMode === "stats"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Estatísticas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          {viewMode === "stats" ? (
            <TeamStats players={sortedPlayers} />
          ) : (
            <>
              {/* Results Info */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-bold text-gray-900">{sortedPlayers.length}</span> de{" "}
                  <span className="font-bold text-gray-900">{players.length}</span> jogadores
                </p>
                {selectedTeam && (
                  <div className="text-xs text-gray-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    📊 Filtrado por: <span className="font-semibold">{selectedTeam}</span>
                  </div>
                )}
              </div>

              {/* Players Grid */}
              {sortedPlayers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sortedPlayers.map((player, idx) => {
                    const playersInPosition = players.filter((p) => p.pos === player.pos);
                    const sortedByValue = playersInPosition.sort((a, b) => b.market_value - a.market_value);
                    const positionRank = sortedByValue.findIndex((p) => p.name === player.name) + 1;
                    return (
                      <PlayerCard
                        key={`${player.team}-${player.name}-${idx}`}
                        player={player}
                        isTopPlayer={topPlayerNames.has(player.name)}
                        positionRank={positionRank}
                        totalInPosition={playersInPosition.length}
                        allPlayers={players}
                      />
                    );
                  })}
                </div>
              ) : (
                <Card className="p-12 text-center border-0 bg-white shadow-sm">
                  <p className="text-gray-700 text-lg font-semibold">Nenhum jogador encontrado</p>
                  <p className="text-gray-500 text-sm mt-2">Tente ajustar seus filtros ou busca.</p>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      {/* Team Builder Modal */}
      <TeamBuilderModal
        open={teamBuilderOpen}
        onClose={() => setTeamBuilderOpen(false)}
        players={players}
        teams={teams}
      />
    </div>
  );
}
