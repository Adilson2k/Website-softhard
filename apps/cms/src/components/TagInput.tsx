import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "../lib/utils";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({
  tags,
  onTagsChange,
  placeholder = "Adiciona uma tag...",
}: TagInputProps) {
  const [input, setInput] = useState("");

  const handleAddTag = (tagText: string) => {
    if (tagText.trim() && !tags.includes(tagText.trim())) {
      const newTags = [...tags, tagText.trim()];
      onTagsChange(newTags);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(input);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-row gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-zinc-900/5"
        />
        <button
          onClick={() => handleAddTag(input)}
          className={cn(
            "cms-primary inline-flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
          )}
          title="Adicionar tag"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Adicionar</span>
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="cms-primary inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
            >
              <span>{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:opacity-70 transition-opacity"
                title="Remover tag"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tags.length === 0 && (
        <p className="text-xs text-zinc-400">Nenhuma tag adicionada</p>
      )}
    </div>
  );
}
