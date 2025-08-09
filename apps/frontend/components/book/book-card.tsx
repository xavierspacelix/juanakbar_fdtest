import { Book } from "@/types/book";
import Image from "next/image";
import { Star } from "lucide-react";

export function BookCard({ book }: { book: Book }) {
  const imageUrl = book.thumbnail
    ? `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}${book.thumbnail}`
    : "https://placehold.co/400x600.png?text=No+Image";
  return (
    <div className="group cursor-pointer h-full">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">

        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={imageUrl}
            alt={`${book.title} cover`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium text-gray-700">{book.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">
            {book.title}
          </h3>
          <p className="text-gray-600 text-xs mb-3 line-clamp-1">{book.author}</p>

          <div className="flex-1"></div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(book.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
