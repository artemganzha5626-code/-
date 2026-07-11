import Image from 'next/image';
import type { ComponentType, SVGProps } from 'react';
import type { MenuItem } from '@/types';
import {
  CupIcon,
  BeanIcon,
  WineIcon,
  CocktailIcon,
  CakeIcon,
  CroissantIcon,
  LeafIcon,
} from '@/components/icons';

type Visual = { gradient: string; Icon: ComponentType<SVGProps<SVGSVGElement>> };

/** Тепла брендова плитка за типом позиції (коли немає реального фото). */
function pickVisual(item: MenuItem): Visual {
  const t = `${item.categorySlug} ${item.group ?? ''} ${item.name}`.toLowerCase();
  const has = (...w: string[]) => w.some((x) => t.includes(x));

  if (has('матч', 'маття', 'matcha'))
    return { gradient: 'linear-gradient(135deg,#9cb86e 0%,#4f6b39 100%)', Icon: LeafIcon };
  if (has('вин', 'келих', 'просекко', 'ігрист', 'асті', 'wine', 'просєко'))
    return { gradient: 'linear-gradient(135deg,#9e4560 0%,#4e1f2e 100%)', Icon: WineIcon };
  if (has('коктейл', 'gin', 'tonic', 'mojito', 'мохіто', 'aperol', 'spritz', 'pornstar', 'sunrise', 'garden', 'beefeater'))
    return { gradient: 'linear-gradient(135deg,#e6973f 0%,#b5551f 100%)', Icon: CocktailIcon };
  if (has('чай', 'tea'))
    return { gradient: 'linear-gradient(135deg,#d3af64 0%,#7a5a2c 100%)', Icon: LeafIcon };
  if (has('салат', 'цезар'))
    return { gradient: 'linear-gradient(135deg,#9cb86e 0%,#4f6b39 100%)', Icon: LeafIcon };
  if (has('лимонад', 'комбуча', 'мілкшейк', 'айс ті', 'лимон', 'cold'))
    return { gradient: 'linear-gradient(135deg,#eccb63 0%,#c9962c 100%)', Icon: CocktailIcon };
  if (has('macaron', 'макарон', 'macarons'))
    return { gradient: 'linear-gradient(135deg,#e9b6a0 0%,#c9826a 100%)', Icon: CakeIcon };
  if (has('печиво', 'cookie', 'трубочка', 'горіш', 'пряник', 'бискоті', 'канеле'))
    return { gradient: 'linear-gradient(135deg,#cf9f5f 0%,#8a5f2c 100%)', Icon: CroissantIcon };
  if (has('десерт', 'чізкейк', 'тірамісу', 'trifle', 'наполеон', 'еклер', 'торт', 'cake', 'кекс', 'кейк', 'шу', 'оксамит', 'круасан мигдал'))
    return { gradient: 'linear-gradient(135deg,#d8a0a8 0%,#9c5f66 100%)', Icon: CakeIcon };
  if (has('сендвіч', 'кіш', 'круасан з', 'food'))
    return { gradient: 'linear-gradient(135deg,#a89860 0%,#6b5a2c 100%)', Icon: CroissantIcon };
  if (has('какао', 'шоколад', 'cocoa'))
    return { gradient: 'linear-gradient(135deg,#7a4a2c 0%,#43281a 100%)', Icon: CupIcon };
  if (has('глінтвейн', 'гарбуз', 'very berry', 'berry', 'irish', 'айріш', 'bailyes', 'бейліс', 'сезон'))
    return { gradient: 'linear-gradient(135deg,#c9694a 0%,#8a3f2c 100%)', Icon: CupIcon };
  if (has('бамбл', 'зерн', 'фільтр', 'v60'))
    return { gradient: 'linear-gradient(135deg,#8a5632 0%,#43281a 100%)', Icon: BeanIcon };

  // За замовчуванням — кава
  return { gradient: 'linear-gradient(135deg,#7a5233 0%,#3b2416 100%)', Icon: CupIcon };
}

export function MenuVisual({
  item,
  sizes,
  iconClassName = 'h-1/3 w-1/3 max-h-20 max-w-20',
}: {
  item: MenuItem;
  sizes: string;
  iconClassName?: string;
}) {
  if (item.image) {
    return (
      <Image
        src={item.image}
        alt={item.name}
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }
  const { gradient, Icon } = pickVisual(item);
  return (
    <div
      className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105"
      style={{ background: gradient }}
    >
      <Icon className={`${iconClassName} text-cream/85`} strokeWidth={1.3} />
    </div>
  );
}
