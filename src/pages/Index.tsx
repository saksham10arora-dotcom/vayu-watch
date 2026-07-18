import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import AQIDashboard from "@/components/AQIDashboard";
import InteractiveMap from "@/components/InteractiveMap";
import ForecastChart from "@/components/ForecastChart";
import AlertPanel from "@/components/AlertPanel";
import HistoricalTrends from "@/components/HistoricalTrends";
import MLPrediction from "@/components/MLPrediction";
import Footer from "@/components/Footer";
import { useAirQuality } from "@/hooks/useAirQuality";

const Index = () => {
  const [input, setInput] = useState("");
  const { data, loading, error, search } = useAirQuality();

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL;
    if (api) fetch(`${api}/`).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search(input);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* City Search Bar */}
      <div className="sticky top-[69px] z-40 bg-black/95 border-b border-gray-800 backdrop-blur">
        <div className="container mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search any city — Delhi, London, New York..."
                className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Loading..." : "Search"}
            </button>
          </form>
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
      </div>

      <main>
        <AQIDashboard data={data} loading={loading} />
        <InteractiveMap lat={data?.lat} lon={data?.lon} city={data?.city} aqi={data?.current.aqi} />
        <ForecastChart forecast={data?.forecast ?? []} loading={loading} />
        <AlertPanel />
        <HistoricalTrends historical={data?.historical ?? []} loading={loading} />
        <MLPrediction city={data?.city} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
