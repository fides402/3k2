import React from 'react';
import { Genre, Decade, DigParams } from '../types';

interface ControlsProps {
  params: DigParams;
  setParams: React.Dispatch<React.SetStateAction<DigParams>>;
  onDig: () => void;
  loading: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ params, setParams, onDig, loading }) => {
  
  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams(prev => ({ ...prev, genre: e.target.value as Genre }));
  };

  const handleDecadeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams(prev => ({ ...prev, decade: e.target.value as Decade }));
  };

  return (
    <div className="bg-retroOrange border-4 border-ink shadow-hard p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
      {/* Decorative Screw Heads */}
      <div className="absolute top-2 left-2 w-3 h-3 rounded-full border-2 border-ink bg-gray-300 flex items-center justify-center">
        <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
      </div>
      <div className="absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-ink bg-gray-300 flex items-center justify-center">
         <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
      </div>
      <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full border-2 border-ink bg-gray-300 flex items-center justify-center">
         <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
      </div>
      <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full border-2 border-ink bg-gray-300 flex items-center justify-center">
         <div className="w-full h-[1px] bg-ink transform rotate-45"></div>
      </div>

      <div className="text-center mb-2">
        <h2 className="font-display text-2xl md:text-3xl uppercase tracking-tighter text-ink bg-paper inline-block px-2 border-2 border-ink transform -rotate-2">
          Filter Config
        </h2>
      </div>

      <div className="space-y-4">
        {/* Genre Selector */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-sm font-bold uppercase tracking-widest text-ink">Target Genre</label>
          <div className="relative">
            <select 
              value={params.genre}
              onChange={handleGenreChange}
              disabled={loading}
              className="w-full appearance-none bg-paper border-4 border-ink rounded-none p-3 font-serif text-xl focus:outline-none focus:bg-white transition-colors cursor-pointer"
            >
              {Object.values(Genre).map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink bg-retroRed border-l-4 border-ink">
              <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* Decade Selector */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-sm font-bold uppercase tracking-widest text-ink">Era Selection</label>
          <div className="relative">
            <select 
              value={params.decade}
              onChange={handleDecadeChange}
              disabled={loading}
              className="w-full appearance-none bg-paper border-4 border-ink rounded-none p-3 font-serif text-xl focus:outline-none focus:bg-white transition-colors cursor-pointer"
            >
              {Object.values(Decade).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-ink bg-retroRed border-l-4 border-ink">
              <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={onDig}
          disabled={loading}
          className={`
            w-full py-6 font-display text-3xl uppercase tracking-widest border-4 border-ink shadow-hard transition-all
            ${loading ? 'bg-gray-400 cursor-not-allowed translate-x-1 translate-y-1 shadow-none' : 'bg-retroTeal text-white hover:bg-ink hover:text-retroTeal hover:-translate-y-1 hover:shadow-hard-lg active:translate-y-1 active:shadow-none'}
          `}
        >
          {loading ? 'DIGGING...' : 'INSTANT DIG'}
        </button>
      </div>

      <div className="border-t-4 border-ink border-dashed pt-4 mt-2">
        <p className="font-mono text-xs text-center leading-tight">
          SYSTEM STATUS: <span className={loading ? "text-white bg-ink px-1 blink" : "text-ink"}>{loading ? 'SCANNING CRATES' : 'BUFFER READY'}</span>
        </p>
      </div>
    </div>
  );
};