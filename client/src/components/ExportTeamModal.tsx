import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import * as QRCode from "qrcode.react";
import html2canvas from "html2canvas";
import { Download, Copy, Check } from "lucide-react";
import { positionDetails, getSector } from "@/lib/constants";

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
  squadPosition: "DEF" | "MEI" | "ATA";
}

interface ExportTeamModalProps {
  open: boolean;
  onClose: () => void;
  team: {
    homeTeam: string;
    formation: string;
    squad: SquadPlayer[];
    totalValue: number;
    avgRating: number;
  };
}

export default function ExportTeamModal({ open, onClose, team }: ExportTeamModalProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Generate shareable link (simulated)
  const shareableLink = `https://market-value.manus.space/team/${btoa(JSON.stringify(team)).substring(0, 20)}`;

  // Export as image
  const exportAsImage = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `elenco-${team.homeTeam}-${new Date().getTime()}.png`;
      link.click();
    } catch (error) {
      console.error("Erro ao exportar imagem:", error);
    } finally {
      setExporting(false);
    }
  };

  // Copy link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download QR code
  const downloadQR = () => {
    if (!qrRef.current) return;
    const qrCanvas = qrRef.current.querySelector("canvas");
    if (qrCanvas) {
      const link = document.createElement("a");
      link.href = qrCanvas.toDataURL("image/png");
      link.download = `qr-${team.homeTeam}.png`;
      link.click();
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Exportar Elenco</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Team Preview */}
          <div ref={exportRef} className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg border-2 border-blue-200">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{team.homeTeam}</h2>
              <p className="text-lg text-gray-700 font-semibold">{team.formation}</p>
            </div>

            {/* Squad Display */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="grid grid-cols-11 gap-2 text-center">
                {/* GK */}
                <div className="col-span-11 mb-4">
                  <div className="bg-green-100 rounded-lg p-3">
                    {team.squad
                      .filter((p) => p.pos === "GK")
                      .map((p) => (
                        <div key={p.name}>
                          <p className="font-bold text-sm">{p.name}</p>
                          <p className="text-xs text-gray-600">{p.pos}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* DEF */}
                {team.squad
                  .filter((p) => getSector(p.pos) === "DEF" && p.pos !== "GK")
                  .map((p) => (
                    <div key={p.name} className="bg-green-50 rounded p-2 text-xs">
                      <p className="font-bold">{p.name.split(" ")[0]}</p>
                      <p className="text-gray-600">{p.pos}</p>
                    </div>
                  ))}

                {/* MEI */}
                <div className="col-span-11 my-4 border-t-2 border-gray-300"></div>
                {team.squad
                  .filter((p) => getSector(p.pos) === "MEI")
                  .map((p) => (
                    <div key={p.name} className="bg-amber-50 rounded p-2 text-xs">
                      <p className="font-bold">{p.name.split(" ")[0]}</p>
                      <p className="text-gray-600">{p.pos}</p>
                    </div>
                  ))}

                {/* ATA */}
                <div className="col-span-11 my-4 border-t-2 border-gray-300"></div>
                {team.squad
                  .filter((p) => getSector(p.pos) === "ATA")
                  .map((p) => (
                    <div key={p.name} className="bg-red-50 rounded p-2 text-xs">
                      <p className="font-bold">{p.name.split(" ")[0]}</p>
                      <p className="text-gray-600">{p.pos}</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-600">Valor Total</p>
                <p className="text-xl font-bold text-blue-600">${team.totalValue.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-600">Rating Médio</p>
                <p className="text-xl font-bold text-blue-600">{team.avgRating}</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-600">Jogadores</p>
                <p className="text-xl font-bold text-blue-600">{team.squad.length}</p>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Opções de Exportação</h3>

            {/* Download as Image */}
            <Button
              onClick={exportAsImage}
              disabled={exporting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Download size={18} className="mr-2" />
              {exporting ? "Exportando..." : "Baixar como Imagem"}
            </Button>

            {/* QR Code Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Código QR</h4>
              <div ref={qrRef} className="flex justify-center mb-3">
                <QRCode value={shareableLink} size={200} level="H" includeMargin={true} />
              </div>
              <Button onClick={downloadQR} variant="outline" className="w-full">
                <Download size={16} className="mr-2" />
                Baixar QR Code
              </Button>
            </div>

            {/* Share Link */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Link para Compartilhar</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="px-4"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </Button>
              </div>
              {copied && <p className="text-xs text-green-600 mt-2">✓ Copiado!</p>}
            </div>
          </div>

          {/* Close Button */}
          <Button onClick={onClose} variant="outline" className="w-full">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
