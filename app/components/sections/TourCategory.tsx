import React from "react";

interface TourCategoryProps {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  bgClass?: string;
}

export default function TourCategory({
  id,
  title,
  subtitle,
  children,
  bgClass = "bg-white"
}: TourCategoryProps) {
  return (
    <section id={id} className={`py-16 md:py-24 ${bgClass}`}>
      <div className="container px-4">
        <div className="text-center mb-12">
          <span className="inline-block py-1.5 px-4 rounded-full bg-nature-green/10 text-nature-green text-xs font-bold tracking-widest uppercase mb-4">
            Khám Phá Tour
          </span>
          <h2 className="font-geist text-3xl md:text-4xl font-black text-text-dark mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-text-mid text-sm md:text-base max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Mobile-first Grid layout for children (TourCards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {children}
        </div>
      </div>
    </section>
  );
}
