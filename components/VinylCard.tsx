import React from 'react';
import { TrackData } from '../types';

interface VinylCardProps {
  track: TrackData | null;
  loading: boolean;
}

export const VinylCard: React.FC<VinylCardProps> = ({ track, loading }) => {
  if (loading) {
    return (
      <div className="w-full h-full min-h-[400px] bg-paper border-4 border-ink shadow-hard flex flex-col items-center justify-center p-8 animate-pulse">
        <div className="w-32 h-32 rounded-full border-8 border-ink border-dashed animate-spin duration-3000 mb-6 flex items-center justify-center bg-retroOrange">
          <div className="w-4 h-4 bg-paper rounded-full"></div>
        </div>
        <h3 className="font-display text-2xl text-ink uppercase">Rummaging...</h3>
        <p className="font-mono text-sm mt-2">Scanning frequency bands...</p>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="w-full h-full min-h-[400px] bg-paper border-4 border-ink shadow-hard flex flex-col items-center justify-center p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-retroTeal opacity-10 transform skew-y-12 translate-y-20"></div>
        <div className="border-4 border-ink p-8 transform rotate-2 bg-white shadow-hard-sm">
           <h3 className="font-display text-4xl text-ink text-center opacity-20 group-hover:opacity-40 transition-opacity">EMPTY<br/>CRATE</h3>
        </div>
        <p className="font-mono text-ink mt-8 z-10 bg-retroOrange px-2 border-2 border-ink">Select parameters and hit DIG</p>
      </div>
    );
  }

  // Consistent Search URL generation - Removed 'vinyl' as requested
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.artist} ${track.title}`)}`;

  return (
    <div className="w-full h-full bg-paper border-4 border-ink shadow-hard relative flex flex-col">
      {/* Top Banner (Obi Strip style) */}
      <div className="bg-retroRed text-paper py-2 px-4 border-b-4 border-ink flex justify-between items-center">
        <span className="font-mono text-xs font-bold uppercase tracking-widest">{track.label}</span>
        <span className="font-display text-xl">{track.catalogNumber || 'CAT-001'}</span>
      </div>

      <div className="p-4 md:p-6 lg:p-8 flex-grow flex flex-col gap-4">
        
        {/* Header Block */}
        <div className="border-b-4 border-ink pb-4">
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl leading-[0.85] text-ink uppercase break-words mb-2 mix-blend-multiply">
            {track.title}
          </h1>
          <h2 className="font-serif text-xl md:text-2xl italic text-retroTeal">
            {track.artist}
          </h2>
        </div>

        {/* Video Player Container */}
        <div className="w-full aspect-video bg-black border-4 border-ink shadow-hard-sm relative z-10 overflow-hidden group">
          {track.youtubeId ? (
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed/${track.youtubeId}`} 
              title={track.title} 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-retroOrange bg-opacity-10">
               <p className="font-mono text-xs mb-4 text-ink">VIDEO PREVIEW UNAVAILABLE</p>
               <a 
                 href={searchUrl} 
                 target="_blank" 
                 rel="noreferrer"
                 className="px-6 py-3 bg-ink text-paper font-display text-xl uppercase hover:bg-retroRed transition-colors"
               >
                 Open on YouTube
               </a>
            </div>
          )}
        </div>

        {/* Persistent Search Link (Always Visible) */}
        <div className="flex justify-end border-b-2 border-ink border-dashed pb-4">
            <a 
              href={searchUrl}
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 font-mono text-sm font-bold uppercase text-ink hover:text-retroRed hover:underline transition-colors cursor-pointer"
            >
              <span>[ ↗ Open Search on YouTube ]</span>
            </a>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="bg-white border-2 border-ink p-2 shadow-hard-sm transform -rotate-1 hover:rotate-0 transition-transform">
            <p className="font-mono text-[10px] text-gray-500 uppercase">Year</p>
            <p className="font-display text-lg">{track.year}</p>
          </div>
          <div className="bg-white border-2 border-ink p-2 shadow-hard-sm transform rotate-1 hover:rotate-0 transition-transform">
            <p className="font-mono text-[10px] text-gray-500 uppercase">Country</p>
            <p className="font-display text-lg">{track.country || 'Unknown'}</p>
          </div>
          <div className="col-span-2 bg-white border-2 border-ink p-3 shadow-hard-sm">
            <p className="font-mono text-[10px] text-gray-500 uppercase">Digger's Note</p>
            <p className="font-serif italic leading-tight mt-1">{track.description}</p>
          </div>
        </div>

      </div>
    </div>
  );
};