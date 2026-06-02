import React from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Search } from "lucide-react";

interface HeroSectionProps {
  backgroundImageUrl?: string;
  title?: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
}

export default function HeroSection({
  backgroundImageUrl = "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2000",
  title = "Khám Phá Bản Sắc Cao Bằng",
  subtitle = "Trải nghiệm vùng đất non nước hùng vĩ cùng người bản địa",
  onSearch
}: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden" id="hero">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImageUrl} 
          alt="Cao Bằng Hero" 
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container flex flex-col items-center text-center px-4 mt-20">
        <span className="inline-block py-1.5 px-4 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-widest uppercase mb-6 border border-white/30">
          Cao Bằng Travel Connect
        </span>
        
        <h1 className="font-geist text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6 drop-shadow-lg">
          {title}
        </h1>
        
        <p className="text-lg md:text-xl text-white/90 max-w-2xl font-medium mb-10 drop-shadow-md">
          {subtitle}
        </p>

        {/* Search Bar */}
        <form 
          onSubmit={handleSearch}
          className="w-full max-w-2xl bg-white/10 backdrop-blur-md p-2 rounded-full flex flex-col md:flex-row gap-2 border border-white/20 shadow-2xl"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 w-5 h-5" />
            <Input 
              type="text" 
              placeholder="Bạn muốn đi đâu? (VD: Thác Bản Giốc, Pác Bó...)"
              className="w-full h-12 pl-12 pr-4 rounded-full bg-white/20 border-none text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            type="submit" 
            className="h-12 rounded-full bg-warm-yellow hover:bg-yellow-500 text-nature-green font-bold px-8 text-base transition-colors"
          >
            Tìm Kiếm
          </Button>
        </form>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <a href="#destinations" className="flex flex-col items-center text-white/70 hover:text-white transition-colors">
          <span className="text-xs font-semibold tracking-widest uppercase mb-2">Khám Phá</span>
          <i className="fa-solid fa-chevron-down" />
        </a>
      </div>
    </section>
  );
}
