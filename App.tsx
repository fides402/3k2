import React, { useState, useEffect, useRef } from 'react';
import { digForRecord } from './services/geminiService';
import { Controls } from './components/Controls';
import { VinylCard } from './components/VinylCard';
import { DigParams, Genre, Decade, TrackData } from './types';

const STORAGE_KEY = 'crate_digger_history_v1';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [track, setTrack] = useState<TrackData | null>(null);
  
  // Initialize history from LocalStorage
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  });
  
  // Buffering system for instant results
  const [buffer, setBuffer] = useState<TrackData | null>(null);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  
  const [params, setParams] = useState<DigParams>({
    genre: Genre.SOUL,
    decade: Decade.D1970
  });

  // Persist history whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  // Track params changes to invalidate buffer
  const prevParamsRef = useRef<DigParams>(params);

  // Effect: Clear buffer when params change
  useEffect(() => {
    if (prevParamsRef.current.genre !== params.genre || prevParamsRef.current.decade !== params.decade) {
      setBuffer(null);
      prevParamsRef.current = params;
    }
  }, [params]);

  // Effect: Background Buffering
  // If we don't have a buffer, and we aren't currently loading the main track, 
  // and we aren't already buffering... fetch the next one silently.
  useEffect(() => {
    const fillBuffer = async () => {
      if (buffer || isBuffering || loading) return;

      setIsBuffering(true);
      try {
        // Construct exclusion list: History + Current Displayed Track
        const currentExcludes = [...history];
        if (track) {
          currentExcludes.push(`${track.artist} - ${track.title}`);
        }

        // Dig silently
        const result = await digForRecord(params, currentExcludes);
        
        // Only set if params haven't changed during the fetch
        if (params.genre === prevParamsRef.current.genre && params.decade === prevParamsRef.current.decade) {
          setBuffer(result);
        }
      } catch (e) {
        console.error("Background buffering failed", e);
      } finally {
        setIsBuffering(false);
      }
    };

    // Small delay to prioritize UI rendering over background fetch
    const timeout = setTimeout(fillBuffer, 500);
    return () => clearTimeout(timeout);
  }, [buffer, isBuffering, loading, params, history, track]);


  const handleDig = async () => {
    if (loading) return;

    // SCENARIO 1: Instant Load from Buffer
    if (buffer) {
      setTrack(buffer);
      setHistory(prev => [...prev, `${buffer.artist} - ${buffer.title}`]);
      setBuffer(null); // Clear buffer, which triggers the Effect to refill it immediately
      return;
    }

    // SCENARIO 2: Cold Load (Buffer empty or invalidated)
    setLoading(true);
    setTrack(null); 
    try {
      const result = await digForRecord(params, history);
      setTrack(result);
      setHistory(prev => [...prev, `${result.artist} - ${result.title}`]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearMemory = () => {
    if (window.confirm("Are you sure you want to wipe the crate memory? You might see repeat suggestions.")) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
      setBuffer(null); // Clear buffer as it might be based on old history
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans selection:bg-retroRed selection:text-white pb-20">
      <div className="grain-overlay"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row items-end justify-between border-b-8 border-ink pb-4">
          <div>
            <h1 className="font-display text-5xl md:text-7xl text-ink tracking-tighter leading-none">
              SAMPLE<br/>HUNTER
            </h1>
            <p className="font-mono text-sm md:text-base mt-2 bg-retroTeal text-white inline-block px-2 py-1 transform rotate-1 border-2 border-ink shadow-hard-sm">
              VIRTUAL CRATE DIGGING ASSISTANT
            </p>
          </div>
          <div className="hidden md:block">
             <div className={`w-24 h-24 rounded-full border-8 border-ink flex items-center justify-center transition-colors duration-500 ${isBuffering || loading ? 'bg-retroOrange animate-spin-slow' : 'bg-retroRed'}`}>
                <div className="w-8 h-8 rounded-full bg-paper border-4 border-ink"></div>
             </div>
             {/* Status Indicator */}
             <div className="text-center mt-2 font-mono text-xs font-bold uppercase">
                {isBuffering ? 'PRE-LOADING...' : (buffer ? 'CRATE READY' : 'IDLE')}
             </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <section className="lg:col-span-4">
            <div className="sticky top-8">
              <Controls 
                params={params} 
                setParams={setParams} 
                onDig={handleDig} 
                loading={loading}
              />
              
              {/* Instructions Panel */}
              <div className="mt-8 bg-paper border-4 border-ink p-6 transform rotate-1 shadow-hard-sm hidden lg:block">
                <h3 className="font-display text-xl uppercase mb-2">How it works</h3>
                <ul className="list-disc pl-5 font-serif italic space-y-2 text-lg">
                  <li>Select your target genre.</li>
                  <li>Choose the golden era.</li>
                  <li>Press DIG.</li>
                  <li>
                    <span className="bg-retroOrange px-1 border border-ink text-sm font-bold not-italic">NEW</span>{' '}
                    The system remembers what you've found across sessions.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Right Column: Result */}
          <section className="lg:col-span-8 min-h-[600px]">
            <VinylCard track={track} loading={loading} />
          </section>

        </main>

        {/* Footer */}
        <footer className="mt-16 border-t-4 border-ink pt-6 flex flex-col md:flex-row justify-between items-center text-xs font-mono uppercase opacity-60 gap-4">
           <div>
             <span>Model: Gemini 3 Flash (Buffered)</span>
             <span className="mx-2">|</span>
             <span>Est. 2025</span>
           </div>
           
           <div className="flex items-center gap-2">
             <span>Memory: {history.length} tracks</span>
             <button 
               onClick={handleClearMemory}
               className="underline hover:text-retroRed cursor-pointer"
             >
               [RESET]
             </button>
           </div>
        </footer>

      </div>
    </div>
  );
};

export default App;