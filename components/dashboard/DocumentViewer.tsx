"use client";

export type ViewerDoc = {
  title: string;
  url: string;
  material_type: string;
};

interface Props {
  material: ViewerDoc | null;
  onClose: () => void;
}

export function DocumentViewer({ material, onClose }: Props) {
  if (!material) return null;

  const isPdf = material.material_type === "pdf";
  const src = isPdf
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(material.url)}&embedded=true`
    : `https://docs.google.com/gview?url=${encodeURIComponent(material.url)}&embedded=true`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-green-700 flex-shrink-0">
        <div className={`px-2 py-0.5 rounded text-xs font-bold ${
          isPdf ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
        }`}>
          {isPdf ? "PDF" : "DOC"}
        </div>
        <span className="text-white font-semibold text-sm flex-1 truncate">
          {material.title}
        </span>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </button>
      </div>

      {/* Document area */}
      <div className="flex-1 relative bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-gray-400 text-sm">Opening document...</p>
        </div>
        <iframe
          src={src}
          className="absolute inset-0 w-full h-full border-0"
          title={material.title}
        />
      </div>
    </div>
  );
}
