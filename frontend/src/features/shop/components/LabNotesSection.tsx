import Image from 'next/image';

import { labNotes } from '@/features/shop/mocks/homepage.data';

export default function LabNotesSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-18 sm:px-6 lg:px-8">
      <div className="mb-6 grid gap-3 sm:grid-cols-2 sm:items-end">
        <div>
          <p className="text-primary mb-2 text-xs font-semibold tracking-widest uppercase">
            TECHNICAL INSIGHTS
          </p>
          <h2 className="text-foreground text-3xl font-bold tracking-tight">
            Lab Notes
          </h2>
        </div>
        <p className="text-muted-foreground text-sm sm:text-right text-center">
          Deep dives into switch mechanics, material science, and custom
          programming for the enthusiast community.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {labNotes.map((note) => (
          <article key={note.title} className="group">
            <div className="border-border/60 bg-card/30 relative overflow-hidden rounded-xl border">
              <div className="relative aspect-16/10 overflow-hidden">
                <Image
                  src={note.image}
                  alt={note.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
            <p className="text-primary mt-3 text-[0.7rem] font-semibold tracking-[0.16em] uppercase">
              {note.category}
            </p>
            <h3 className="text-foreground mt-2 text-xl leading-snug font-semibold">
              {note.title}
            </h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {note.excerpt}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
