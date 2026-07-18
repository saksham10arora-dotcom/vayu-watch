import { Satellite, Globe, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer id="about" className="bg-muted/30 border-t border-border text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About the project */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Satellite className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Vayu Watch</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real-time air quality and personalized public health guidance for Delhi,
              built on live government ground station data and Gemini-generated advisories.
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/saksham10arora-dotcom/vayu-watch" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Source
              </a>
            </Button>
          </div>

          {/* Coverage */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Coverage</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground">Region:</h4>
                <p>Delhi NCR, India</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Ground Stations:</h4>
                <p>24 live DPCC / CPCB monitors</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Update Frequency:</h4>
                <p>Hourly, live on request</p>
              </div>
              <div>
                <h4 className="font-medium text-foreground">Key Pollutants:</h4>
                <p>PM2.5, PM10, NO₂, O₃, SO₂, CO</p>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Sources</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>WAQI / Delhi Pollution Control Committee</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Open-Meteo Air Quality &amp; Weather</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span>Google Gemini (health advisories)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span>Elasticsearch (locality history)</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              No fabricated data sources — every number on this page traces back to a real API response.
            </p>
          </div>

          {/* Contact & Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <div className="space-y-2">
              <a href="https://aqicn.org/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Globe className="h-4 w-4" />
                <span>World Air Quality Index Project</span>
              </a>
              <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink className="h-4 w-4" />
                <span>Open-Meteo API Docs</span>
              </a>
              <a href="mailto:saksham10arora@gmail.com" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                <span>Contact</span>
              </a>
            </div>
          </div>
        </div>

        <hr className="border-border my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Satellite className="h-5 w-5 text-primary" />
              <span className="font-semibold">Vayu Watch</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Built for Elastic × Google Cloud Hacknight, Delhi
            </span>
          </div>

          <div className="flex items-center space-y-2 md:space-y-0 md:space-x-6 text-xs text-muted-foreground flex-col md:flex-row">
            <span>© 2026 Vayu Watch</span>
            <span className="hidden md:inline">•</span>
            <span>Real Delhi ground station data</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
