import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

interface TourCardProps {
  id: string;
  title: string;
  imageUrl: string;
  locationTag: string;
  duration: string;
  price: string;
  onBookNow?: () => void;
}

export default function TourCard({
  id,
  title,
  imageUrl,
  locationTag,
  duration,
  price,
  onBookNow
}: TourCardProps) {
  return (
    <Card className="overflow-hidden group flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <i className="fa-solid fa-map text-4xl text-slate-400" />
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-nature-green text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          {locationTag}
        </div>
      </div>

      <CardContent className="flex-1 p-5 flex flex-col gap-3">
        <div className="flex items-center text-xs text-text-light font-medium gap-1.5">
          <i className="fa-regular fa-clock" />
          <span>{duration}</span>
        </div>
        <h3 className="text-lg font-bold text-text-dark font-geist leading-tight line-clamp-2">
          {title}
        </h3>
        <div className="mt-auto pt-2">
          <div className="text-sm text-text-mid font-medium">Giá từ</div>
          <div className="text-xl font-black text-nature-green">{price}</div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button 
          onClick={onBookNow} 
          className="w-full bg-warm-yellow hover:bg-yellow-500 text-nature-green font-bold text-sm h-11"
        >
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
}
