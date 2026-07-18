import { useEffect, useState } from "react";
import { Loader2, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocalities, useAdvisory, type Locality, type HealthProfile } from "@/hooks/useLocalities";

function aqiColor(aqi: number | null): string {
  if (aqi === null) return "text-gray-400";
  if (aqi <= 50) return "text-green-400";
  if (aqi <= 100) return "text-yellow-400";
  if (aqi <= 150) return "text-orange-400";
  if (aqi <= 200) return "text-red-400";
  return "text-purple-400";
}

function aqiBg(aqi: number | null): string {
  if (aqi === null) return "border-border";
  if (aqi <= 50) return "border-green-400/40";
  if (aqi <= 100) return "border-yellow-400/40";
  if (aqi <= 150) return "border-orange-400/40";
  if (aqi <= 200) return "border-red-400/40";
  return "border-purple-400/40";
}

const PROFILES: { value: HealthProfile; label: string }[] = [
  { value: "healthy", label: "Healthy Adult" },
  { value: "asthma", label: "Asthma / Respiratory" },
  { value: "child", label: "Young Child" },
  { value: "elderly", label: "Elderly" },
  { value: "pregnant", label: "Pregnant" },
];

const DelhiLocalitiesPage = () => {
  const { localities, elasticEnabled, loading, error, fetchLocalities } = useLocalities();
  const { snapshot, advisory, loading: advisoryLoading, error: advisoryError, fetchAdvisory } = useAdvisory();
  const [selected, setSelected] = useState<Locality | null>(null);
  const [profile, setProfile] = useState<HealthProfile>("healthy");

  useEffect(() => {
    fetchLocalities();
  }, [fetchLocalities]);

  const handleAdvisory = (loc: Locality) => {
    setSelected(loc);
    fetchAdvisory(loc.uid, profile);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Delhi Locality Watch</h1>
            <p className="text-muted-foreground">
              Live AQI from {localities.length || "24"} real DPCC/CPCB ground stations across Delhi
            </p>
            {elasticEnabled && (
              <Badge variant="secondary" className="mt-2">
                Indexing every reading to Elasticsearch
              </Badge>
            )}
          </div>

          {loading && localities.length === 0 && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
            </div>
          )}

          {error && (
            <p className="text-center text-red-400 mb-6">{error}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-6xl mx-auto mb-10">
            {localities.map((loc, i) => (
              <Card
                key={loc.uid}
                className={`border-2 ${aqiBg(loc.aqi)} hover:shadow-lg transition-shadow cursor-pointer ${selected?.uid === loc.uid ? "ring-2 ring-blue-400" : ""}`}
                onClick={() => handleAdvisory(loc)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm flex items-start gap-1.5 leading-tight">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      {loc.locality}
                    </CardTitle>
                    {i === 0 && <Badge variant="destructive" className="shrink-0 text-[10px]">Worst</Badge>}
                    {i === localities.length - 1 && <Badge variant="secondary" className="shrink-0 text-[10px]">Best</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div className={`text-4xl font-bold ${aqiColor(loc.aqi)}`}>
                      {loc.aqi != null ? Math.round(loc.aqi) : "--"}
                    </div>
                    <Badge variant="outline" className="text-[10px]">{loc.label}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                Personalized Health Advisory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <Select
                  value={profile}
                  onValueChange={(v) => {
                    setProfile(v as HealthProfile);
                    if (selected) fetchAdvisory(selected.uid, v as HealthProfile);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-56">
                    <SelectValue placeholder="Health profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFILES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  {selected ? `for ${selected.locality}` : "Click a station above to get advisory"}
                </span>
              </div>

              {advisoryLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating advisory via Gemini…
                </div>
              )}
              {advisoryError && <p className="text-red-400 text-sm">{advisoryError}</p>}

              {snapshot && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs text-muted-foreground">
                  <div>PM2.5<div className="text-foreground font-medium">{snapshot.pm2_5 ?? "--"}</div></div>
                  <div>PM10<div className="text-foreground font-medium">{snapshot.pm10 ?? "--"}</div></div>
                  <div>NO₂<div className="text-foreground font-medium">{snapshot.no2 ?? "--"}</div></div>
                  <div>O₃<div className="text-foreground font-medium">{snapshot.o3 ?? "--"}</div></div>
                  <div>SO₂<div className="text-foreground font-medium">{snapshot.so2 ?? "--"}</div></div>
                  <div>CO<div className="text-foreground font-medium">{snapshot.co ?? "--"}</div></div>
                </div>
              )}

              {advisory && (
                <div className="bg-muted/30 rounded-lg p-4 text-sm leading-relaxed">
                  {advisory}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DelhiLocalitiesPage;
