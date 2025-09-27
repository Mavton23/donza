import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, AlertCircle, RefreshCw } from 'lucide-react';

// Configuração do PDF.js worker - Múltiplas opções para fallback
const setupPdfWorker = () => {
  try {
    // Opção 1: Usar CDN oficial
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
  } catch (error) {
    console.warn('Falha na configuração do worker do PDF.js:', error);
  }
};

// Configurar o worker quando o componente for importado
setupPdfWorker();

export default function PdfViewer({ src, title }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef(null);

  console.log("SRC DO PDF: ", src)

  // Atualizar largura do container quando a janela for redimensionada
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - 40); // 40px de padding
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('Erro ao carregar PDF:', error);
    setIsLoading(false);
    setError('Falha ao carregar o PDF. Verifique se o arquivo é válido.');
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.max(1, Math.min(newPage, numPages));
    });
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const goToPage = (page) => {
    const pageNum = parseInt(page);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      setPageNumber(pageNum);
    }
  };

  const retryLoad = () => {
    setIsLoading(true);
    setError(null);
  };

  // Calcular largura da página baseada no container e scale
  const pageWidth = Math.min(containerWidth * 0.9, 800) * scale;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg" ref={containerRef}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
        <div className="flex items-center space-x-4 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1">
            {title}
          </h2>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {/* Navegação */}
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={previousPage}
              disabled={pageNumber <= 1 || isLoading}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Página anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max={numPages}
                value={pageNumber}
                onChange={(e) => goToPage(e.target.value)}
                onBlur={(e) => goToPage(e.target.value)}
                className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-center"
                disabled={isLoading || !numPages}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                de {numPages || '--'}
              </span>
            </div>
            
            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages || isLoading}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Próxima página"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Controles de Zoom */}
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5 || isLoading}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <button
              onClick={resetZoom}
              disabled={scale === 1.0 || isLoading}
              className="px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-50 transition-colors"
            >
              {Math.round(scale * 100)}%
            </button>
            
            <button
              onClick={zoomIn}
              disabled={scale >= 3.0 || isLoading}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Download */}
          <a
            href={src}
            download={`${title}.pdf`}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Conteúdo PDF */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-[500px] flex items-center justify-center">
        {error ? (
          // Estado de erro
          <div className="text-center p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Erro ao carregar PDF
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              {error}
            </p>
            <button
              onClick={retryLoad}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center mx-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </button>
          </div>
        ) : isLoading ? (
          // Estado de carregamento
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando PDF...</p>
          </div>
        ) : (
          // PDF carregado com sucesso
          <div className="max-w-full overflow-auto" style={{ maxHeight: '70vh' }}>
            <Document
              file={src}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Carregando PDF...</p>
                </div>
              }
              error={
                <div className="text-center text-red-600 dark:text-red-400">
                  Erro ao carregar o documento
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                width={pageWidth}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="mx-auto shadow-lg"
                loading={
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Carregando página...</p>
                  </div>
                }
              />
            </Document>
          </div>
        )}
      </div>

      {/* Footer com informações */}
      {numPages && !error && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <span>PDF carregado com sucesso</span>
            <span>{numPages} página{numPages !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
}