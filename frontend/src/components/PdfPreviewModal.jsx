import { Download, ExternalLink, FileText, X } from 'lucide-react';

const PdfPreviewModal = ({ pdf, onClose }) => {
  if (!pdf) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 p-4">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-yellow-400 text-slate-950">
              <FileText size={20} />
            </span>
            <div>
              <h3 className="font-bold text-slate-950">Previsualización de PDF</h3>
              <p className="text-sm text-slate-500">{pdf.filename}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={pdf.url}
              download={pdf.filename}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              <Download size={16} />
              Descargar
            </a>
            <a
              href={pdf.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              <ExternalLink size={16} />
              Abrir en nueva pestaña
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <X size={16} />
              Cerrar
            </button>
          </div>
        </div>
        <div className="min-h-[60vh] bg-slate-100 p-3">
          <iframe
            title="Previsualización del PDF"
            src={pdf.url}
            className="h-[72vh] w-full rounded border border-slate-200 bg-white"
          />
          <p className="mt-3 text-center text-xs text-slate-500">
            Si el navegador no permite la vista previa, el PDF fue generado correctamente y puedes abrirlo desde Descargas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;
