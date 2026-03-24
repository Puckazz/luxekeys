import Image from 'next/image';
import Link from 'next/link';

import { communityShowcaseImages } from '@/features/shop/mocks/homepage.data';

const desktopMosaicClasses = [
  'lg:col-start-1 lg:row-start-1 lg:row-span-2',
  'lg:col-start-2 lg:row-start-1',
  'lg:col-start-2 lg:row-start-2',
  'lg:col-start-3 lg:row-start-1 lg:row-span-2',
  'lg:col-start-4 lg:row-start-1',
  'lg:col-start-4 lg:row-start-2',
];

export default function CommunityShowcaseSection() {
  return (
    <section className="mx-auto w-full pb-18">
      <div className="mx-auto mb-4 flex max-w-7xl items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-primary mb-2 text-xs font-semibold tracking-widest uppercase">
            BUILT BY YOU
          </p>
          <h2 className="text-foreground text-3xl font-bold tracking-tight">
            Community Showcase
          </h2>
        </div>
        <Link
          href="/"
          className="text-primary hidden text-xs font-semibold tracking-wider uppercase hover:opacity-80 sm:inline"
        >
          Follow @midnight_obsidian →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:aspect-2/1 lg:grid-cols-4 lg:grid-rows-2">
        {communityShowcaseImages.map((item, index) => (
          <article
            key={`${item.alt}-${index}`}
            className={[
              'relative aspect-square overflow-hidden lg:aspect-auto',
              desktopMosaicClasses[index] ?? '',
            ].join(' ')}
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
