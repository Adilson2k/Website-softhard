import React from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Escreve aqui...",
}: RichTextEditorProps) {
  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      <div className="bg-white p-6 min-h-[400px]">
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-full bg-transparent border-none focus:ring-0 resize-none text-zinc-700 leading-relaxed text-base p-0 outline-none"
        />
      </div>
    </div>
  );
}
