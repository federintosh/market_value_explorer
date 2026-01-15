import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Search, Plus, Trash2, Download, Lightbulb, ChevronRight, Share2 } from "lucide-react";
import { formations, FormationType, positionCategories, positionDetails, getSector, TEAM_BUILDING_BUDGET } from "@/lib/constants";
import ExportTeamModal from "./ExportTeamModal";

interface Player {
  team: string;
  pos: string;
  name: string;
  rating: number;
  base_value: number;
  multiplier: number;
  market_value: number;
}

interface SquadPlayer extends Player {
  squadPosition: keyof typeof positionCategories;
}

interface SavedTeam {
  id: number;
  name: string;
  homeTeam: string;
  formation: FormationType;
  squad: SquadPlayer[];
  totalValue: number;
  avgRating: number;
  date: string;
}

interface PlayerSuggestion {
  type: "cheap" | "expensive" | "value";
  player: Player;
  reason: string;
}

interface TeamBuilderModalProps {
  open: boolean;
  onClose: () => void;
  players: Player[];
  teams: string[];
}

export default function TeamBuilderModal({ open, onClose, players, teams }: TeamBuilderModalProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedFormation, setSelectedFormation] = useState<FormationType>("4-3-3");
  const [squad, setSquad] = useState<SquadPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [budget, setBudget] = useState(TEAM_BUILDING_BUDGET);
  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState<"cheap" | "expensive" | "value">("value");
  const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<"build" | "history">("build");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportTeam, setExportTeam] = useState<any>(null);

  // Load saved teams from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedTeams");
    if (saved) setSavedTeams(JSON.parse(saved));
  }, []);

  // Get home team players (free)
  const homeTeamPlayers = useMemo(() => {
    return selectedTeam ? players.filter((p) => p.team === selectedTeam) : [];
  }, [selectedTeam, players]);

  // Get available players for selection (excluding squad players)
  const availablePlayers = useMemo(() => {
    const squadPlayerIds = new Set(squad.map((p) => `${p.team}-${p.name}`));
    return players.filter((p) => !squadPlayerIds.has(`${p.team}-${p.name}`));
  }, [players, squad]);

  // Filter players for search
  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.pos.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [availablePlayers, searchQuery]);

  // Calculate squad stats
  const squadStats = useMemo(() => {
    const stats = {
      DEF: 0,
      MEI: 0,
      ATA: 0,
      GK: 0,
      totalRating: 0,
      totalPlayers: 0,
      totalValue: 0,
    };

    squad.forEach((p) => {
      const sector = getSector(p.pos);
      stats[sector]++;
      if (p.pos === "GK") stats.GK++;
      stats.totalRating += p.rating;
      stats.totalPlayers++;
      stats.totalValue += p.team === selectedTeam ? 0 : p.market_value;
    });

    return stats;
  }, [squad, selectedTeam]);

  const formationRequirements = formations[selectedFormation];
  const isFormationComplete =
    squadStats.GK === formationRequirements.GK &&
    squadStats.DEF === formationRequirements.DEF &&
    squadStats.MEI === formationRequirements.MEI &&
    squadStats.ATA === formationRequirements.ATA;

  // Generate suggestions
  const generateSuggestions = () => {
    const neededSector = squadStats.GK < formationRequirements.GK ? "DEF" :
                         squadStats.DEF < formationRequirements.DEF ? "DEF" :
                         squadStats.MEI < formationRequirements.MEI ? "MEI" :
                         squadStats.ATA < formationRequirements.ATA ? "ATA" : null;

    if (!neededSector) return;

    const sectorPositions = positionCategories[neededSector].positions;
    const candidatesForSector = availablePlayers.filter((p) => sectorPositions.includes(p.pos));

    const newSuggestions: PlayerSuggestion[] = [];

    if (suggestionType === "cheap") {
      const cheapest = candidatesForSector
        .filter((p) => (p.team === selectedTeam ? 0 : p.market_value) <= budget)
        .sort((a, b) => (a.team === selectedTeam ? 0 : a.market_value) - (b.team === selectedTeam ? 0 : b.market_value))
        .slice(0, 3);

      cheapest.forEach((p) => {
        newSuggestions.push({
          type: "cheap",
          player: p,
          reason: `Mais barato para ${positionCategories[neededSector].label}`,
        });
      });
    } else if (suggestionType === "expensive") {
      const mostExpensive = candidatesForSector
        .filter((p) => (p.team === selectedTeam ? 0 : p.market_value) <= budget)
        .sort((a, b) => (b.team === selectedTeam ? 0 : b.market_value) - (a.team === selectedTeam ? 0 : a.market_value))
        .slice(0, 3);

      mostExpensive.forEach((p) => {
        newSuggestions.push({
          type: "expensive",
          player: p,
          reason: `Melhor rating para ${positionCategories[neededSector].label}`,
        });
      });
    } else {
      const avgRating = candidatesForSector.reduce((sum, p) => sum + p.rating, 0) / candidatesForSector.length;
      const bestValue = candidatesForSector
        .filter((p) => (p.team === selectedTeam ? 0 : p.market_value) <= budget)
        .map((p) => ({
          player: p,
          ratio: p.rating / (p.team === selectedTeam ? 1 : p.market_value),
        }))
        .sort((a, b) => b.ratio - a.ratio)
        .slice(0, 3);

      bestValue.forEach(({ player }) => {
        newSuggestions.push({
          type: "value",
          player,
          reason: `Melhor custo-benefício para ${positionCategories[neededSector].label}`,
        });
      });
    }

    setSuggestions(newSuggestions);
  };

  // Add player to squad
  const addPlayerToSquad = (player: Player, squadPosition: keyof typeof positionCategories) => {
    const cost = player.team === selectedTeam ? 0 : player.market_value;
    if (cost <= budget) {
      setSquad([...squad, { ...player, squadPosition }]);
      setBudget(budget - cost);
      setShowSuggestions(false);
    }
  };

  // Remove player from squad
  const removePlayerFromSquad = (index: number) => {
    const player = squad[index];
    const cost = player.team === selectedTeam ? 0 : player.market_value;
    setSquad(squad.filter((_, i) => i !== index));
    setBudget(budget + cost);
  };

  // Save team
  const saveTeam = () => {
    if (!isFormationComplete) {
      alert("Formação incompleta!");
      return;
    }

    const newTeam: SavedTeam = {
      id: Date.now(),
      name: `${selectedTeam} - ${formations[selectedFormation].label}`,
      homeTeam: selectedTeam!,
      formation: selectedFormation,
      squad,
      totalValue: TEAM_BUILDING_BUDGET - budget,
      avgRating: Math.round((squadStats.totalRating / squadStats.totalPlayers) * 10) / 10,
      date: new Date().toISOString(),
    };

    const updated = [...savedTeams, newTeam];
    setSavedTeams(updated);
    localStorage.setItem("savedTeams", JSON.stringify(updated));
    alert("Elenco salvo com sucesso!");
  };

  // Load saved team
  const loadSavedTeam = (team: SavedTeam) => {
    setSelectedTeam(team.homeTeam);
    setSelectedFormation(team.formation);
    setSquad(team.squad);
    setBudget(TEAM_BUILDING_BUDGET - team.totalValue);
    setActiveTab("build");
  };

  // Delete saved team
  const deleteSavedTeam = (id: number) => {
    const updated = savedTeams.filter((t) => t.id !== id);
    setSavedTeams(updated);
    localStorage.setItem("savedTeams", JSON.stringify(updated));
  };

  // Export team
  const handleExportTeam = () => {
    if (!isFormationComplete) {
      alert("Formação incompleta!");
      return;
    }
    setExportTeam({
      homeTeam: selectedTeam,
      formation: formations[selectedFormation].label,
      squad,
      totalValue: TEAM_BUILDING_BUDGET - budget,
      avgRating: Math.round((squadStats.totalRating / squadStats.totalPlayers) * 10) / 10,
    });
    setExportOpen(true);
  };

  const renderSquadPosition = (sector: keyof typeof positionCategories, index: number) => {
    const playerIndex = squad.findIndex((p) => p.squadPosition === sector && squad.filter((sp) => sp.squadPosition === sector).indexOf(p) === index);
    const player = playerIndex >= 0 ? squad[playerIndex] : null;

    return (
      <div key={`${sector}-${index}`} className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-2 text-center min-h-24 flex flex-col items-center justify-center hover:border-blue-400 transition-colors">
        {player ? (
          <div className="w-full">
            <p className="font-bold text-xs text-gray-900 truncate">{player.name}</p>
            <p className="text-xs text-gray-600">{player.pos}</p>
            <p className="text-xs font-semibold text-blue-600">${(player.team === selectedTeam ? 0 : player.market_value).toFixed(2)}</p>
            <p className="text-xs text-gray-500">Rating: {player.rating}</p>
            <button
              onClick={() => removePlayerFromSquad(playerIndex)}
              className="mt-1 text-red-600 hover:text-red-800 text-xs"
            >
              <Trash2 size={12} className="inline" /> Remover
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500">Vazio</p>
        )}
      </div>
    );
  };

  if (!open) return null;

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Montar Elenco Ideal</DialogTitle>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setActiveTab("build")}
              className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "build" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Montar
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "history" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              Histórico ({savedTeams.length})
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors ml-4"
              title="Fechar"
            >
              <X size={24} />
            </button>
          </div>
        </DialogHeader>

        {activeTab === "build" ? (
          <div className="grid grid-cols-3 gap-4 h-full overflow-hidden">
            {/* Left: Formation and Squad */}
            <div className="col-span-1 border-r border-gray-300 overflow-y-auto pr-4">
              <div className="space-y-4">
                {/* Team Selection */}
                <div>
                  <label className="text-sm font-bold text-gray-700">Seu Time</label>
                  <select
                    value={selectedTeam || ""}
                    onChange={(e) => {
                      setSelectedTeam(e.target.value || null);
                      setSquad([]);
                      setBudget(TEAM_BUILDING_BUDGET);
                    }}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Selecione um time</option>
                    {teams.map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Formation Selection */}
                {selectedTeam && (
                  <div>
                    <label className="text-sm font-bold text-gray-700">Formação</label>
                    <select
                      value={selectedFormation}
                      onChange={(e) => setSelectedFormation(e.target.value as FormationType)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {Object.entries(formations).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Budget Info */}
                {selectedTeam && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <p className="text-sm font-semibold text-gray-700">Orçamento Restante</p>
                    <p className="text-2xl font-bold text-blue-600">${budget.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-1">Gasto: ${(TEAM_BUILDING_BUDGET - budget).toFixed(2)}</p>
                  </Card>
                )}

                {/* Formation Status */}
                {selectedTeam && (
                  <Card className={`p-4 ${isFormationComplete ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
                    <p className="text-sm font-semibold text-gray-700">Status da Formação</p>
                    <div className="text-xs space-y-1 mt-2">
                      <p>GK: {squadStats.GK}/{formationRequirements.GK}</p>
                      <p>DEF: {squadStats.DEF}/{formationRequirements.DEF}</p>
                      <p>MEI: {squadStats.MEI}/{formationRequirements.MEI}</p>
                      <p>ATA: {squadStats.ATA}/{formationRequirements.ATA}</p>
                    </div>
                    {isFormationComplete && <p className="text-xs text-green-700 font-bold mt-2">✓ Formação Completa!</p>}
                  </Card>
                )}

                {/* Squad Stats */}
                {selectedTeam && squadStats.totalPlayers > 0 && (
                  <Card className="p-4 bg-purple-50 border-purple-200">
                    <p className="text-sm font-semibold text-gray-700">Estatísticas do Elenco</p>
                    <div className="text-xs space-y-1 mt-2">
                      <p>Jogadores: {squadStats.totalPlayers}</p>
                      <p>Rating Médio: {squadStats.totalRating > 0 ? (squadStats.totalRating / squadStats.totalPlayers).toFixed(1) : 0}</p>
                      <p>Valor Total: ${squadStats.totalValue.toFixed(2)}</p>
                    </div>
                  </Card>
                )}

                {/* Save Button */}
                {selectedTeam && isFormationComplete && (
                  <div className="space-y-2">
                    <Button onClick={saveTeam} className="w-full bg-green-600 hover:bg-green-700">
                      <Download size={16} className="mr-2" />
                      Salvar Elenco
                    </Button>
                    <Button onClick={handleExportTeam} className="w-full bg-blue-600 hover:bg-blue-700">
                      <Share2 size={16} className="mr-2" />
                      Exportar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Squad Visualization */}
            <div className="col-span-1 border-r border-gray-300 overflow-y-auto px-4">
              {selectedTeam ? (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-900">{formations[selectedFormation].label}</h3>

                  {/* GK */}
                  <div>
                    <p className="text-xs font-bold text-gray-600 mb-2">GOLEIRO</p>
                    {renderSquadPosition("DEF", 0)}
                  </div>

                  {/* DEF */}
                  <div>
                    <p className="text-xs font-bold text-gray-600 mb-2">DEFESA ({formationRequirements.DEF})</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: formationRequirements.DEF }).map((_, i) =>
                        renderSquadPosition("DEF", i + 1)
                      )}
                    </div>
                  </div>

                  {/* MEI */}
                  <div>
                    <p className="text-xs font-bold text-gray-600 mb-2">MEIO ({formationRequirements.MEI})</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: formationRequirements.MEI }).map((_, i) =>
                        renderSquadPosition("MEI", i)
                      )}
                    </div>
                  </div>

                  {/* ATA */}
                  <div>
                    <p className="text-xs font-bold text-gray-600 mb-2">ATAQUE ({formationRequirements.ATA})</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: formationRequirements.ATA }).map((_, i) =>
                        renderSquadPosition("ATA", i)
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-600">Selecione um time para começar</p>
              )}
            </div>

            {/* Right: Player Search and Selection */}
            <div className="col-span-1 overflow-y-auto">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <Input
                    placeholder="Buscar jogador..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Suggestions Button */}
                {selectedTeam && !isFormationComplete && (
                  <Button
                    onClick={() => {
                      generateSuggestions();
                      setShowSuggestions(!showSuggestions);
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    <Lightbulb size={16} className="mr-2" />
                    {showSuggestions ? "Ocultar" : "Sugestões"}
                  </Button>
                )}

                {/* Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="space-y-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <p className="text-xs font-bold text-amber-900">Sugestões Inteligentes</p>
                    <div className="space-y-2">
                      {suggestions.map((sugg, idx) => (
                        <Card key={idx} className="p-2 bg-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-bold text-xs text-gray-900">{sugg.player.name}</p>
                              <p className="text-xs text-gray-600">{sugg.player.team}</p>
                              <p className="text-xs text-amber-600 font-semibold">{sugg.reason}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-xs text-blue-600">
                                ${(sugg.player.team === selectedTeam ? 0 : sugg.player.market_value).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => addPlayerToSquad(sugg.player, "DEF")}
                          >
                            <Plus size={12} className="mr-1" />
                            Adicionar
                          </Button>
                        </Card>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowSuggestions(false)}
                    >
                      Continuar Procurando
                    </Button>
                  </div>
                )}

                {/* Players List */}
                <div className="space-y-2">
                  {filteredPlayers.slice(0, 30).map((player) => {
                    const cost = player.team === selectedTeam ? 0 : player.market_value;
                    const canAfford = cost <= budget;
                    const isFromHomeTeam = player.team === selectedTeam;

                    return (
                      <Card
                        key={`${player.team}-${player.name}`}
                        className={`p-3 cursor-pointer transition-all ${
                          canAfford ? "hover:shadow-md" : "opacity-50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-bold text-sm text-gray-900">{player.name}</p>
                            <p className="text-xs text-gray-600">{player.team}</p>
                            <p className="text-xs text-gray-500">{player.pos} • Rating: {player.rating}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-sm ${isFromHomeTeam ? "text-green-600" : "text-blue-600"}`}>
                              ${cost.toFixed(2)}
                            </p>
                            {isFromHomeTeam && <p className="text-xs text-green-600 font-semibold">Grátis</p>}
                          </div>
                        </div>
                        {canAfford && selectedTeam && (
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => addPlayerToSquad(player, "DEF")}
                          >
                            <Plus size={14} className="mr-1" />
                            Adicionar
                          </Button>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto">
            <div className="space-y-3">
              {savedTeams.length === 0 ? (
                <p className="text-center text-gray-600 py-8">Nenhum elenco salvo ainda</p>
              ) : (
                savedTeams.map((team) => (
                  <Card key={team.id} className="p-4 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{team.name}</p>
                        <p className="text-sm text-gray-600">{team.formation}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          <p>Rating Médio: {team.avgRating}</p>
                          <p>Valor Total: ${team.totalValue.toFixed(2)}</p>
                          <p>Data: {new Date(team.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => loadSavedTeam(team)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ChevronRight size={14} />
                          Carregar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSavedTeam(team.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Export Modal */}
    {exportTeam && (
      <ExportTeamModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        team={exportTeam}
      />
    )}
  </>
  );
}
