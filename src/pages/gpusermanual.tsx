import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Upload, Download, Volume2, VolumeX, Pause, Play } from 'lucide-react';

const SinglePagePDFViewer = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageImages, setPageImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('');
  const [scale, setScale] = useState(0.9);
  const [pdfFileName, setPdfFileName] = useState('');
  const [showFileInput, setShowFileInput] = useState(false);
  const [pageText, setPageText] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const fileInputRef = useRef(null);
  const speechRef = useRef(null);

  useEffect(() => {
    loadPDF();
    // Check if speech synthesis is supported
    setSpeechSupported('speechSynthesis' in window);
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const fileURL = URL.createObjectURL(file);
      loadPDFFromURL(fileURL, file.name);
    }
  };

  const loadPDFFromURL = async (url, fileName = 'Selected PDF') => {
    try {
      setLoading(true);
      setError(null);
      
      if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      
      const loadingTask = window.pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setPdfFileName(fileName);
      setPageImages({});
      setCurrentPage(1);
      
      // Pre-render first few pages
      await renderPage(pdf, 1);
      if (pdf.numPages > 1) await renderPage(pdf, 2);
      if (pdf.numPages > 2) await renderPage(pdf, 3);
      
      setLoading(false);
      setShowFileInput(false);
    } catch (err) {
      setError('Failed to load PDF: ' + err.message);
      setLoading(false);
    }
  };

  const loadPDF = async () => {
    try {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = async () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        // Try common PDF file names
        const possibleFiles = [
          '/presentation.pdf',
          '/document.pdf', 
          '/manual.pdf',
          '/gpmanual.pdf',
          '/water-management.pdf',
          '/flipbook.pdf'
        ];
        
        let pdf = null;
        let foundFile = '';
        
        for (const file of possibleFiles) {
          try {
            const loadingTask = window.pdfjsLib.getDocument(file);
            pdf = await loadingTask.promise;
            foundFile = file;
            break;
          } catch (e) {
            continue;
          }
        }
        
        if (!pdf) {
          setShowFileInput(true);
          throw new Error('No PDF file found in public directory. Please select a PDF file to upload.');
        }
        
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setPdfFileName(foundFile);
        
        // Pre-render first few pages
        await renderPage(pdf, 1);
        if (pdf.numPages > 1) await renderPage(pdf, 2);
        if (pdf.numPages > 2) await renderPage(pdf, 3);
        
        setLoading(false);
      };
      
      script.onerror = () => {
        setError('Failed to load PDF library');
        setLoading(false);
      };
      
      document.head.appendChild(script);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const renderPage = async (pdf, pageNum) => {
    if (pageImages[pageNum]) return pageImages[pageNum];
    
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.5 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.width);
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        background: 'white'
      };
      
      await page.render(renderContext).promise;
      
      // Extract text content
      try {
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join(' ');
        if (pageNum === currentPage) {
          setPageText(text);
        }
      } catch (textErr) {
        console.warn('Could not extract text from page:', textErr);
      }
      
      const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPageImages(prev => ({ ...prev, [pageNum]: imageUrl }));
      return imageUrl;
    } catch (err) {
      console.error('Error rendering page:', err);
      setPageImages(prev => ({ ...prev, [pageNum]: 'error' }));
      return null;
    }
  };

  const goToPage = async (targetPage) => {
    if (targetPage < 1 || targetPage > totalPages || isTransitioning || targetPage === currentPage) return;
    
    // Stop any ongoing speech
    stopReading();
    
    const direction = targetPage > currentPage ? 'next' : 'prev';
    setTransitionDirection(direction);
    setIsTransitioning(true);
    
    if (pdfDoc && !pageImages[targetPage]) {
      await renderPage(pdfDoc, targetPage);
    }
    
    // Extract text for the new page
    if (pdfDoc) {
      try {
        const page = await pdfDoc.getPage(targetPage);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join(' ');
        setPageText(text);
      } catch (err) {
        console.warn('Could not extract text from page:', err);
        setPageText('');
      }
    }
    
    setTimeout(() => {
      setCurrentPage(targetPage);
      setIsTransitioning(false);
    }, 300);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setScale(0.9);

  // Download functionality
  const downloadPDF = () => {
    if (pdfFileName) {
      // Create a download link
      const link = document.createElement('a');
      link.href = pdfFileName.startsWith('/') ? pdfFileName : `/${pdfFileName}`;
      link.download = pdfFileName.replace(/^\//, '') || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Detect if text contains Hindi characters
  const containsHindi = (text) => {
    const hindiRegex = /[\u0900-\u097F]/;
    return hindiRegex.test(text);
  };

  // Text-to-Speech functionality with Hindi and English support
  const startReading = () => {
    if (!speechSupported || !pageText.trim()) return;
    
    stopReading(); // Stop any existing speech
    
    const utterance = new SpeechSynthesisUtterance(pageText);
    const voices = window.speechSynthesis.getVoices();
    const isHindiText = containsHindi(pageText);
    
    if (isHindiText) {
      // Look for Hindi voices first
      const hindiVoice = voices.find(voice => 
        voice.lang.includes('hi-IN') || 
        voice.lang.includes('hi') ||
        voice.name.toLowerCase().includes('hindi') ||
        voice.name.toLowerCase().includes('हिन्दी')
      );
      
      if (hindiVoice) {
        utterance.voice = hindiVoice;
        utterance.lang = 'hi-IN';
      } else {
        // Fallback to Indian English for mixed content
        const indianEnglishVoice = voices.find(voice => 
          voice.lang.includes('en-IN')
        );
        if (indianEnglishVoice) {
          utterance.voice = indianEnglishVoice;
          utterance.lang = 'en-IN';
        }
      }
      
      // Configure for Hindi speech
      utterance.rate = 0.7; // Slower for Hindi pronunciation
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
    } else {
      // English text - try to find an Indian English voice
      const indianVoice = voices.find(voice => 
        voice.lang.includes('en-IN') || 
        voice.name.toLowerCase().includes('indian') ||
        voice.name.toLowerCase().includes('india')
      );
      
      if (indianVoice) {
        utterance.voice = indianVoice;
        utterance.lang = 'en-IN';
      } else {
        // Fallback to any English voice
        const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
          utterance.lang = 'en-US';
        }
      }
      
      // Configure for English speech with Indian accent
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.volume = 0.9;
    }
    
    utterance.onstart = () => {
      setIsReading(true);
      setIsPaused(false);
    };
    
    utterance.onend = () => {
      setIsReading(false);
      setIsPaused(false);
    };
    
    utterance.onerror = (event) => {
      console.warn('Speech synthesis error:', event.error);
      setIsReading(false);
      setIsPaused(false);
    };
    
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };
  
  const pauseReading = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };
  
  const resumeReading = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };
  
  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-slate-700 text-lg font-medium">Loading your presentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center text-red-700 bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-5xl mb-4">📄</div>
          <p className="font-semibold text-xl mb-2">Unable to load PDF</p>
          <p className="text-red-600 mb-4">{error}</p>
          
          {showFileInput && (
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload size={20} />
                Select PDF File
              </button>
            </div>
          )}
          
          <div className="text-sm text-red-500 mt-4">
            <p>Or place your PDF file in the public directory with one of these names:</p>
            <div className="text-left mt-2 space-y-1">
              <div>• presentation.pdf</div>
              <div>• document.pdf</div>
              <div>• manual.pdf</div>
              <div>• flipbook.pdf</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = (currentPage / totalPages) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-4 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white mb-2 tracking-wide">
          PDF Presentation Viewer
        </h1>
        <div className="text-slate-300 text-sm">
          Page {currentPage} of {totalPages}
        </div>
        {pdfFileName && (
          <div className="text-slate-400 text-xs mt-1">
            {pdfFileName.replace(/^\//, '')}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={prevPage}
          disabled={currentPage === 1 || isTransitioning}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-sm"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <div className="flex items-center gap-1 bg-slate-800/80 backdrop-blur rounded-lg px-2 py-2 shadow-lg">
          <button onClick={zoomOut} className="p-1 text-white hover:bg-slate-700 rounded transition-colors">
            <ZoomOut size={14} />
          </button>
          <span className="text-white text-xs font-medium px-2 min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={zoomIn} className="p-1 text-white hover:bg-slate-700 rounded transition-colors">
            <ZoomIn size={14} />
          </button>
          <button onClick={resetZoom} className="p-1 text-white hover:bg-slate-700 rounded transition-colors">
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Download Button */}
        <button
          onClick={downloadPDF}
          disabled={!pdfFileName}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-sm"
        >
          <Download size={16} />
          Download
        </button>

        
        {showFileInput && (
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg text-sm"
          >
            <Upload size={16} />
            Load PDF
          </button>
        )}

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages || isTransitioning}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-sm"
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Main Presentation Frame */}
      <div className="flex justify-center items-center">
        <div 
          className="relative"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease'
          }}
        >
          {/* Presentation Frame - Landscape Format */}
          <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 p-6 rounded-2xl shadow-2xl">
            
            {/* Single Page Container - Fixed Landscape Dimensions */}
            <div 
              className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
              style={{ width: '1200px', height: '675px' }} // 16:9 landscape ratio
            >
              
              {/* Page Content */}
              <div className="relative w-full h-full">
                <div 
                  className={`absolute inset-0 transition-all duration-300 transform ${
                    isTransitioning && transitionDirection === 'next' ? 'translate-x-full opacity-0' : 
                    isTransitioning && transitionDirection === 'prev' ? '-translate-x-full opacity-0' : 
                    'translate-x-0 opacity-100'
                  }`}
                >
                  {pageImages[currentPage] && pageImages[currentPage] !== 'error' ? (
                    <img
                      src={pageImages[currentPage]}
                      alt={`Page ${currentPage}`}
                      className="w-full h-full object-contain p-6"
                      draggable={false}
                      onError={() => console.error(`Failed to load page ${currentPage} image`)}
                    />
                  ) : pageImages[currentPage] === 'error' ? (
                    <div className="flex items-center justify-center h-full text-red-500">
                      <div className="text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <div className="text-xl font-semibold">Failed to render page {currentPage}</div>
                        <div className="text-sm mt-2 text-red-400">Please try refreshing or loading a different PDF</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <div className="text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <div className="text-xl font-medium">Rendering page {currentPage}...</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Click areas for navigation */}
                <div 
                  className="absolute left-0 top-0 w-1/3 h-full cursor-pointer group z-10"
                  onClick={prevPage}
                >
                  <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                </div>
                
                <div 
                  className="absolute right-0 top-0 w-1/3 h-full cursor-pointer group z-10"
                  onClick={nextPage}
                >
                  <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                </div>
              </div>

              {/* Page transition overlay */}
              {isTransitioning && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide z-20 pointer-events-none"></div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-4 w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

              {/* Page indicator dots */}
            <div className="flex justify-center mt-3 gap-1 flex-wrap max-h-12 overflow-hidden">
              {Array.from({ length: Math.min(totalPages, 20) }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => goToPage(i + 1)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    currentPage === i + 1 
                      ? 'bg-blue-500 scale-125' 
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
              {totalPages > 20 && (
                <div className="text-slate-400 text-xs ml-2">
                  +{totalPages - 20} more
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        .animate-slide {
          animation: slide 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default SinglePagePDFViewer;